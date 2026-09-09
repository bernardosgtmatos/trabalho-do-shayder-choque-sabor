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
    try {
        const newProduct = await Event.create({
            produto,
            descricao,
            valor
        })
        return res.status(200).json('produto adicionado a tabela com sucesso!')
    } catch (error) {
        return res.status(500).json('falha ao adicionar produto!')
    }
}