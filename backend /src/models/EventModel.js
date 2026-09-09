const { DataTypes, UUIDV1, DATEONLY, UUIDV4 } = require('sequelize');
const sequelize = require('../config/Database.js');
const bcrypt = require('bcryptjs');
const { toDefaultValue } = require('sequelize/lib/utils');

const Clientes = sequelize.define('Clientes', { //tabela cliente
    id:{
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    nome:{
        type: DataTypes.STRING,
        allowNull: false
    },
    telefone:{
        type: DataTypes.STRING,
        allowNull: false
    },
    endereço:{
        type: DataTypes.JSON,
        allowNull: false
    }
});

const Produtos = sequelize.define('Produtos', { // tabela produtos disponiveis na loja
    id:{
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    nome:{
        type: DataTypes.STRING,
        allowNull: false
    },
    descrição:{
        type: DataTypes.STRING,
        allowNull: false
    },
    valor:{
        type: DataTypes.DECIMAL(8,2),
        allowNull: false
    },
});


const Pedido = sequelize.define('Pedido', { //tabela pedido, cria um id do pedido relacionado com o cliente
    id:{
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    cliente_id: {
        type: DataTypes.UUID, // aqui vem uma FK da tabela cliente (pega o id da tabela cliente)
        allowNull: false,
        references: {model: 'Clientes' , key: 'id'}
    },
    valortotal:{
        type: DataTypes.DECIMAL(8,2),
        allowNull: false
    }
});

const itens_pedido = sequelize.define('itens_pedido', { // para cada produto diferente é uma linha que depois junta tudo na tabela Pedido somando tudo e criando um id unico para o pedido
    id:{
        type: DataTypes.UUID,
        defaultValue: UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    Pedido_id:{  
        type: DataTypes.UUID,
        allowNull: false,
        references: {model : Pedido , key : 'id'} //importa coluna id da tabela pedidos

    },
    Produtos:{
        type: DataTypes.STRING,
        allowNull: false,
        references: {model : Produtos, key : 'id'} // importa coluna id da tabela produtos
    },
    quatidade:{
        type: DataTypes.DECIMAL(4),
        allowNull: false
    },
    valor:{
        type: DataTypes.DECIMAL(8,2),
        allowNull: false
    }
});

//relacionamento
Clientes.hasMany(Pedido, { foreignKey: 'cliente_id' }); //Um cliente tem muitos pedidos
Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id' }); //Um pedido pertence a um cliente

Pedido.hasMany(ItemPedido, { foreignKey: 'pedido_id' }); //Um pedido tem muitos itens
itens_pedido.belongsTo(Pedido, { foreignKey: 'pedido_id' }); //Um item pertence a um pedido

// syncs / sera retirado dps
Clientes.sync({alter: true});
Produtos.sync({alter: true});
Pedido.sync({alter: true});
itens_pedido.sync({alter: true});

module.exports = {Clientes, Produtos, Pedido, itens_pedido}