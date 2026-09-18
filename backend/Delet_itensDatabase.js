const { where } = require('sequelize')
const sequelize = require('./src/config/Database.js')
const {Clientes, Produtos, Pedido, itens_pedido} = require('./src/models/EventModel.js')
const owner = require('./src/models/UserModel.js')

const removeClient = async () => {
    const t = await sequelize.transaction()
    const FindTel = await Clientes.findOne({
        where: {telefone: '676767676767'} //coloca o numero do usuario dentro das '' para apagar o user
    })
    if (!FindTel){
        console.log('Usuario não existe!');
        await sequelize.close()
        return
    }
    const FindPedidos = await Pedido.findAll({
        where: {cliente_id: FindTel.id}
    })
    // console.log(FindPedidos)
    const Ids = FindPedidos.map((p) => p.id)
    if(Ids.length){
        await itens_pedido.destroy({where: {Pedido_id: Ids}})
        await Pedido.destroy({where: {id: Ids}})
    }
    await FindTel.destroy()
    console.log('cliente e pedidos do cliente removido.');
    
    await sequelize.close()
}
removeClient()