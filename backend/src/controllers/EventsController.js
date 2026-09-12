const {Clientes, Produtos, Pedido, itens_pedido} = require('../models/EventModel.js') 
const sequelize = require('../config/Database.js')
const FormatPhone = require('../Utilis/formatPhone.js')
const { combineTableNames } = require('sequelize/lib/utils')

const newProduct = async (req, res) => { //adciona um produto a tabela 
    const {nome, descrição, valor } = req.body
    if (!nome||!descrição||!valor){
        return res.status(400).json('todos os campos devem ser preenchidos!!')
    }
    try {
        const newProduct = await Produtos.create({
            nome,
            descrição,
            valor
        })
        return res.status(200).json('produto adicionado a tabela com sucesso!')
    } catch (error) {
        return res.status(500).json({
            error: `erro ao adiocinar novo produto a tabela ${error}`})
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
            attributes: ['id', 'nome', 'descrição', 'valor']
        });
        return res.status(200).json(produtos)
    } catch (error) {
        return res.status(500).json(`Erro ao listar produtos ${error}`)
    }
}
module.exports = {newOrder, newProduct , listProdutos}