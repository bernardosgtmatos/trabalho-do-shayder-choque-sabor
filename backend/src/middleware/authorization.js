const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token){
        console.log('sem token de verificação');
        return res.status(401).json('Token não fornecido')
        
    }

    try {
        const validToken = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        return res.status(401).json(`Token inválido, ${error}`)
    }
}
module.exports = auth