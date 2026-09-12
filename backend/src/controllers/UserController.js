const owner = require('../models/UserModel.js')

const CreateUser = async (req , res) => {
    const {nome, email, senha } = req.body
    if (!nome || !email || !senha){
        return res.status(400).json("Todos os campos são obrigatórios")
    }
    const existUser = await owner.findOne({ where: { email } })
    console.log(existUser)

    if (existUser) {
        return res.status(500).json("Este email já foi utilizado")
    }
    try{
        const newUser = await owner.create({
            nome,
            email,
            senha
        })
        return res.status(200).json("Usuario criado!")
    }catch(error){
        return res.status(500).json({
            Error: `error ao criar usuario ${error}`
        })
    }
}

module.exports = CreateUser