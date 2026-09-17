const {Clientes, Produtos, Pedido, itens_pedido} = require('../models/EventModel.js') 
const sequelize = require('../config/Database.js')
const FormatPhone = require('../Utilis/formatPhone.js')
const {supabase, Bucket} = require('../config/supabase.js')
const path = require('path')
const {randomUUID} = require('crypto')
const { fromBuffer: fileTypeFromBuffer } = require('file-type')

const newProduct = async (req, res) => { //adciona um produto a tabela 
    const {nome, descrição, valor } = req.body
    if (!nome||!descrição||!valor){
        return res.status(400).json('todos os campos devem ser preenchidos!!')
    }
    if (!req.file){
        return res.status(400).json('Imagem do produto é obrigatória!')
    }
    const realExt = await fileTypeFromBuffer(req.file.buffer) //retonar em obj a real extensão do arquivo ext: 'png' , mime: image/png or undefined
    if(!realExt){
        return res.status(400).json('Tipo do arquivo incorreto!, apenas permitido arquivos de imagem!')
    }
    try {
        if (req.file.mimetype !== realExt.mime){
            // const falseExtAlert = true
            console.log(`req.file.mimetype is ${req.file.mimetype} and realExt is ${realExt}`);
            return res.status(400).json('extensão do arquivo não confere o conteudo!')
        }
        // const extensão = path.extname(req.file.originalname) || '.png' //extrai extensão do nome do arquivo se for null define como .png
        const dest = `fotos_cardapio/${randomUUID()}.${realExt.ext}` //cria destino com randonUUID e chama a variavel de extensão 
        const { error: uploadError } = await supabase.storage // {error : uploadError } pega a propriedade error de dentro do supabase e renomeia para uploadError e tranforma em uma variavel
            .from(Bucket)
            .upload(dest, req.file.buffer,{
            contentType : realExt.mime,
            upsert: false
        });
        if(uploadError){
            return res.status(500).json(`error no upload da imagem (uploadError): ${uploadError.message}`)
        }
        const { data } = supabase.storage.from(Bucket).getPublicUrl(dest);
        console.log(`url da imagem = ${data.publicUrl}`)
        
        try {
            const produto = await Produtos.create({
                nome,
                descrição,
                valor,
                imageUrl: data.publicUrl,
            })
            return res.status(201).json('produto adicionado a tabela com sucesso!')
        } catch (error) {
            await supabase.storage.from(Bucket).remove([dest]) // remove ([array])
            return res.status(500).json({
                error: `erro ao adiocinar novo produto a tabela ${error}`})
        }    
    } catch (error) {
        console.log(error);
        return res.status(500).json('erro ao dar upload na imagem, tente novamente')
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
module.exports = {newOrder, newProduct , listProdutos, listPedidos}