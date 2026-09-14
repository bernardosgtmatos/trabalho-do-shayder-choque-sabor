const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).json('Token não fornecido')
        console.log('sem token de verificação');
        
    }
    const token = authHeader.split(' ')[1]
    try {
        const validToken = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        return res.status(401).json(`Token inválido, ${error}`)
    }
}
module.exports = auth