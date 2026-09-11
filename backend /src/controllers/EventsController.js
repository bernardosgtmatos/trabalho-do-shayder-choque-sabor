const {Clientes, Produtos, Pedido, itens_pedido} = require('../models/EventModel.js') 
const sequelize = require('../config/Database.js')
const FormatPhone = require('../Utilis/formatPhone.js')

const newOrder = async (req , res) => {
    const {nome, numero, endereço} = req.body //posso colocar todos os itens necessarios para criar um pedido aqui depois eu separo com json 

    if (!nome||!numero||!endereço) {
        return res.status(500).json('todos os campos são obrigatórios!')
    }
    try {
        const newOrder = await Clientes.create({
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
    const t = await sequelize.transaction
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
        let valortotal = 0
        for (const Item of itens){
            const { produto_id, quatidade } = Item
            if (!produto_id||!quatidade||quatidade <= 0){
                await t.rollback()
                return res.status(400).json({
                    error: `error na validação de produto_id e quantidade null ou < 0 ${error}`
                })
            }
        }
        const produto = await Produtos.findByPk(produto_id, {transaction: t})
        if (!produto){
            await t.rollback()
            return res.status(400).json({
                error: `produto (${produto_id} nao encotrado!), Error ${error}`
            })
        }
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            error: `Erro ao fazer o pedido ${error}`
        })
    }


}
module.exports = {newOrder, newProduct}