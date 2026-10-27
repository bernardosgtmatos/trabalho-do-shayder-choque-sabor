const {Clientes, Produtos, Pedido, itens_pedido, categoria} = require('../models/EventModel.js')
const { Op } = require('sequelize')
const sequelize = require('../config/Database.js')
const FormatPhone = require('../Utilis/formatPhone.js')
const {supabase, Bucket} = require('../config/supabase.js')
const path = require('path')
const {randomUUID} = require('crypto')
const { fromBuffer: fileTypeFromBuffer } = require('file-type')

async function uploadProdutoImage(file) {
    const realExt = await fileTypeFromBuffer(file.buffer); //retorna em obj a real extensão do arquivo ext: 'png', mime: image/png ou undefined
    if (!realExt) {
        throw { status: 400, message: 'Tipo do arquivo incorreto!, apenas permitido arquivos de imagem!' };
    }
    if (file.mimetype !== realExt.mime) {
        throw { status: 400, message: 'extensão do arquivo não confere o conteudo!' };
    }
    const dest = `fotos_cardapio/${randomUUID()}.${realExt.ext}`; //cria destino com randomUUID
    const { error: uploadError } = await supabase.storage
        .from(Bucket)
        .upload(dest, file.buffer, {
            contentType: realExt.mime,
            upsert: false
        });
    if (uploadError) {
        throw { status: 500, message: `error no upload da imagem (uploadError): ${uploadError.message}` };
    }
    const { data } = supabase.storage.from(Bucket).getPublicUrl(dest);
    return { dest, publicUrl: data.publicUrl };
}

function storagePathFromUrl(url) {
    if (!url) return null;
    const marker = `/${Bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    try {
        return decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
    } catch (e) {
        return url.slice(idx + marker.length).split('?')[0];
    }
}

const newProduct = async (req, res) => { //adiciona um produto a tabela
    const { nome, descrição, valor, categoria: categoriaNome } = req.body;

    if (!nome || !descrição || !valor || !categoriaNome) {
        return res.status(400).json('todos os campos devem ser preenchidos!!');
    }
    if (!req.file) {
        return res.status(400).json('Imagem do produto é obrigatória!');
    }
    try {
        const cat = await categoria.findOne({ where: { nome: categoriaNome } });
        if (!cat) {
            return res.status(400).json('Categoria inválida!');
        }
        const { dest, publicUrl } = await uploadProdutoImage(req.file);
        try {
            const produto = await Produtos.create({
                nome: String(nome).trim(),
                descrição: String(descrição).trim(),
                valor,
                categoria: categoriaNome,
                imageUrl: publicUrl,
            });
            return res.status(201).json({ message: 'produto adicionado a tabela com sucesso!', id: produto.id });
        } catch (error) {
            await supabase.storage.from(Bucket).remove([dest]);
            return res.status(500).json({ error: `erro ao adicionar novo produto a tabela ${error}` });
        }
    } catch (error) {
        if (error && error.status) {
            return res.status(error.status).json(error.message);
        }
        console.log(error);
        return res.status(500).json('erro ao dar upload na imagem, tente novamente');
    }
}
//tenho que descobrir como por exemplo um item a tabela for adicionado a essa tabela, como eu redireciono a informação json para a tabela de produtos
const newOrder = async (req, res) => { // func de criação de pedido
    const t = await sequelize.transaction()
    try {
        const {nome, telefone, endereço, itens} = req.body // tanto endereço quanto itens são objs
        const telefoneFormat = FormatPhone(telefone)
        
        if (!nome||!telefone||!endereço||!itens){
            await t.rollback()
            return res.status(400).json("Todos os campos são obrigatórios para realizar um pedido!")
        }
        let cliente = await Clientes.findOne({ //procura cliente pelo tel na tabela
            where: {telefone: telefoneFormat},
            transaction : t
        })
        if (!cliente){ // se cliente nao existe ele criar e se existe ele atualiza
            cliente = await Clientes.create({
                nome,
                telefone: telefoneFormat,
                endereço,
            },{transaction: t});
        }
        else{
            cliente.nome = nome;
            cliente.endereço = endereço;
            await cliente.save({transaction: t})
        }
        let valorTotal = 0
        let itens_validados = []
        for (const Item of itens){
            const { produto_id, quatidade } = Item
            if (!produto_id||!quatidade||Number(quatidade) <= 0){
                await t.rollback()
                return res.status(400).json({
                    error: `error na validação de produto_id e quantidade null ou < 0 ${error}`
                })
            }
            const produto = await Produtos.findByPk(produto_id, {transaction: t}) //produto recebe o valor das linhas da tabela pedido pelo findByPk, podendo retornar valores das colunas da tabela (ex: produto.valor retorna o valor do produto)
            if (!produto){
                await t.rollback()
                return res.status(400).json({
                    error: `produto (${produto_id} nao encotrado!), Error ${error}`
                })
            }
            const ValorUnitario = Number(produto.valor) //recebe o valor unitario de cada produto da req.body
            valorTotal += ValorUnitario * Number(quatidade) //soma ao valor total 
            itens_validados.push({ //add na tabela os objs
                Produtos: produto_id,
                quatidade,
                valor: ValorUnitario.toFixed(2)
            })
        }
        const pedido = await Pedido.create({ //add os obs a tabela pedido
            cliente_id: cliente.id,
            valortotal: valorTotal.toFixed(2)
        },{
            transaction: t
        });
        await itens_pedido.bulkCreate( //add um array de varios objs de uma vez
            itens_validados.map((i) => ({ ...i, Pedido_id: pedido.id })),
            { transaction: t }
        );
        await t.commit();
        return res.status(201).json({
            Pedido_id: pedido.id,
            cliente_id: cliente.id,
            valortotal: pedido.valortotal
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            error: `Erro ao fazer o pedido ${error}`
        })
    }
}

//precisa de um controller para listar os produtos para o Usuario
const listProdutos = async (req, res) => {
    try {
        const produtos = await Produtos.findAll({
            attributes: ['id', 'nome', 'descrição', 'valor', 'imageUrl']
        });
        return res.status(200).json(produtos)
    } catch (error) {
        return res.status(500).json(`Erro ao listar produtos ${error}`)
    }
}
//lista os pedidos para o dono (mais novos primeiro, com paginação)
const listPedidos = async (req, res) => {
    let { page = '1', limit = '10' } = req.query;
    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({ error: 'Parâmetro "page" deve ser um inteiro >= 1.' });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        return res.status(400).json({ error: 'Parâmetro "limit" deve ser um inteiro entre 1 e 50.' });
    }

    const offset = (page - 1) * limit;

    try {
        const { count, rows } = await Pedido.findAndCountAll({
            include: [
                { model: Clientes, attributes: ['nome', 'telefone', 'endereço'] },
                { model: itens_pedido, attributes: ['Produtos', 'quatidade', 'valor'] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        //busca os nomes dos produtos de uma vez (evita N+1)
        const produtoIds = [...new Set(
            rows.flatMap((p) => (p.itens_pedidos || []).map((i) => i.Produtos))
        )];
        const produtos = produtoIds.length
            ? await Produtos.findAll({ where: { id: produtoIds }, attributes: ['id', 'nome'] })
            : [];
        const nomes = new Map(produtos.map((p) => [p.id, p.nome]));

        const pedidos = rows.map((pedido) => ({
            id: pedido.id,
            valortotal: pedido.valortotal,
            createdAt: pedido.createdAt,
            cliente: pedido.Cliente ? {
                nome: pedido.Cliente.nome,
                telefone: pedido.Cliente.telefone,
                endereço: pedido.Cliente.endereço
            } : null,
            itens: (pedido.itens_pedidos || []).map((item) => ({
                produto_id: item.Produtos,
                nome: nomes.get(item.Produtos) || null,
                quatidade: item.quatidade,
                valor: item.valor
            }))
        }));

        return res.status(200).json({
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
            pedidos
        });
    } catch (error) {
        return res.status(500).json({ error: `Erro ao listar pedidos: ${error}` });
    }
}

const SORT_COLUMNS = {
    recentes: 'createdAt',
    nome: 'nome',
    preco: 'valor',
};

const listProdutosAdmin = async (req, res) => {
    let { page = '1', limit = '10', search = '', categoria = '', sort = 'recentes', order = 'desc' } = req.query;
    page = Number(page);
    limit = Number(limit);

    if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({ error: 'Parâmetro "page" deve ser um inteiro >= 1.' });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
        return res.status(400).json({ error: 'Parâmetro "limit" deve ser um inteiro entre 1 e 50.' });
    }

    const sortColumn = SORT_COLUMNS[sort];
    if (!sortColumn) {
        return res.status(400).json({ error: 'Parâmetro "sort" inválido.' });
    }
    const sortOrder = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const where = {};
    if (search && String(search).trim()) {
        where.nome = { [Op.like]: `%${String(search).trim()}%` };
    }
    if (categoria && String(categoria).trim()) {
        where.categoria = String(categoria).trim();
    }

    const offset = (page - 1) * limit;
    try {
        const { count, rows } = await Produtos.findAndCountAll({
            where,
            order: [[sortColumn, sortOrder]],
            limit,
            offset,
        });
        return res.status(200).json({
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit),
            produtos: rows,
        });
    } catch (error) {
        return res.status(500).json({ error: `Erro ao listar produtos ${error}` });
    }
}

const getProduto = async (req, res) => {
    const { id } = req.params;
    try {
        const produto = await Produtos.findByPk(id);
        if (!produto) {
            return res.status(404).json('Produto não encontrado!');
        }
        return res.status(200).json(produto);
    } catch (error) {
        return res.status(500).json({ error: `Erro ao buscar produto ${error}` });
    }
}

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { nome, descrição, valor, categoria: categoriaNome } = req.body;
    try {
        const produto = await Produtos.findByPk(id);
        if (!produto) {
            return res.status(404).json('Produto não encontrado!');
        }
        if (nome === undefined && descrição === undefined && valor === undefined && categoriaNome === undefined && !req.file) {
            return res.status(400).json('Nenhum campo para atualizar!');
        }
        if (nome !== undefined && !String(nome).trim()) {
            return res.status(400).json('Nome inválido!');
        }
        if (descrição !== undefined && !String(descrição).trim()) {
            return res.status(400).json('Descrição inválida!');
        }
        if (valor !== undefined) {
            const valorNumero = Number(String(valor).replace(',', '.'));
            if (!Number.isFinite(valorNumero) || valorNumero <= 0) {
                return res.status(400).json('Valor inválido!');
            }
        }
        if (categoriaNome !== undefined) {
            const cat = await categoria.findOne({ where: { nome: categoriaNome } });
            if (!cat) {
                return res.status(400).json('Categoria inválida!');
            }
        }

        const oldImageUrl = produto.imageUrl;
        let uploadedDest = null;
        let newImageUrl = oldImageUrl;
        if (req.file) {
            const uploaded = await uploadProdutoImage(req.file);
            uploadedDest = uploaded.dest;
            newImageUrl = uploaded.publicUrl;
        }
        try {
            if (nome !== undefined) produto.nome = String(nome).trim();
            if (descrição !== undefined) produto.descrição = String(descrição).trim();
            if (valor !== undefined) produto.valor = Number(String(valor).replace(',', '.'));
            if (categoriaNome !== undefined) produto.categoria = categoriaNome;
            if (req.file) produto.imageUrl = newImageUrl;
            await produto.save();
            if (req.file && oldImageUrl) {
                const oldPath = storagePathFromUrl(oldImageUrl);
                if (oldPath) {
                    await supabase.storage.from(Bucket).remove([oldPath]);
                }
            }
            return res.status(200).json({ message: 'Produto atualizado com sucesso!', produto });
        } catch (error) {
            if (uploadedDest) {
                await supabase.storage.from(Bucket).remove([uploadedDest]);
            }
            return res.status(500).json({ error: `erro ao atualizar produto ${error}` });
        }
    } catch (error) {
        if (error && error.status) {
            return res.status(error.status).json(error.message);
        }
        return res.status(500).json({ error: `erro ao atualizar produto ${error}` });
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const produto = await Produtos.findByPk(id);
        if (!produto) {
            return res.status(404).json('Produto não encontrado!');
        }
        const imagePath = storagePathFromUrl(produto.imageUrl);
        try {
            await produto.destroy();
        } catch (error) {
            if (error && (error.name === 'SequelizeForeignKeyConstraintError' || /FOREIGN KEY/i.test(String(error)))) {
                return res.status(409).json('Produto vinculado a pedidos; não pode ser excluído.');
            }
            throw error;
        }
        if (imagePath) {
            try {
                await supabase.storage.from(Bucket).remove([imagePath]);
            } catch (e) {
                console.log(e);
            }
        }
        return res.status(200).json('Produto excluído com sucesso!');
    } catch (error) {
        return res.status(500).json({ error: `erro ao excluir produto ${error}` });
    }
}

const listCategorias = async (req, res) => {
    try {
        const cats = await categoria.findAll({ attributes: ['id', 'nome'], order: [['nome', 'ASC']] });
        return res.status(200).json(cats);
    } catch (error) {
        return res.status(500).json({ error: `Erro ao listar categorias ${error}` });
    }
}

const NewCategoria = async (req,res) => {
    const {nome}= req.body
    if(!nome){
        return res.status(400).json('campo vazio!')
    }
    try {
        const NewCategoria = await categoria.create({
            nome
        })
        return res.status(201).json('categoria nova adicionada com sucesso!')
    } catch (error) {
        return res.status(400).json(`Erro ao criar nova categoria! : ${error}`)
    }
}
module.exports = {newOrder, newProduct, listProdutos, listPedidos, NewCategoria, listProdutosAdmin, getProduto, updateProduct, deleteProduct, listCategorias}