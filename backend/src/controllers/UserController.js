const owner = require('../models/UserModel.js')
const jwt = require('jsonwebtoken')

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

const login = async (req, res) => {
    try {
        const {email, senha} = req.body
        if(!email||!senha){
            return res.status(400).json("Email e senha são obrigatórios!!")
        }
        const user = await owner.scope(null).findOne({
            where: { email }
        });
        if (!user ||!(await user.validSenha(senha))){
            return res.status(401).json('Credencias invalidas')
        }
        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn : '7d'}
        );
        return res.status(200).json({token})
    } catch (error) {
        return res.status(500).json(`Erro ao tentar login! ${error}`)
    }
}

module.exports = {CreateUser, login}