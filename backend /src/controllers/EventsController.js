const Event = require('../models/EventModel.js') 

const newOrder = async (req , res) => {
    const {nome, numero, endereço} = req.body //posso colocar todos os itens necessarios para criar um pedido aqui depois eu separo com json 

    if (!nome||!numero||!endereço) {
        return res.status(500).json('todos os campos são obrigatórios!')
    }
    try {
        const newOrder = await Event.create({
            nome,
            telefone,
            endereço
        })
        return res.status(200).json('pedido realizado com sucesso!')
    } catch (error) {
        return res.status(500).json('Erro ao fazer o pedido!')
    }
}
//tenho que descobrir como por exemplo um item a tabela for adicionado a essa tabela, como eu redireciono a informação json para a tabela de produtos
const newProduct = async (req, res) => { //adciona um produto a tabela 
    const {nome, descrição, valor } = req.body
    if (!nome||!descrição||!valor){
        return res.status(400).json('todos os campos devem ser preenchidos!!')
    }
    try {
        const newProduct = await Event.Produtos.create({
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
module.exports = {newOrder, newProduct}