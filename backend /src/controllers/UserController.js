const User = require('../model/UserModel.js')

const CreateUser = async (req , res) => {
    const {nome, email, senha } = req.body
    if (!nome || !email || !senha){
        return res.status(500).json("Todos os campos são obrigatórios")
    }
    const existUser = await User.findOne({ where: { email } })
    console.log(existUser)

    if (existUser) {
        return res.status(500).json("Este email já foi utilizado")
    }
    try{
        const newUser = await User.create({
            nome,
            email,
            senha
        })
        return res.status(200).json("Usuario criado!")
    }catch(error){
        return res.status(500).json("Erro ao criar usuario!")
    }
}

module.exports = {CreateUser, }