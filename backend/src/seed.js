require('dotenv').config()
const sequelize = require('./config/Database.js')
const owner = require('./models/UserModel.js')
require('./models/EventModel.js')

const seed = async () => {
    try {
        await sequelize.sync()
        const adminEmail = {
            email: "Admin@gmail.com"
        }
        const existUser = await owner.findOne({
            where: adminEmail
        })
        if (!existUser){
            try {
                await owner.create({
                    nome:'Admin',
                    'email':'Admin@gmail.com',
                    'senha': '1234'
                })
                console.log("User + seed criado!");
            } catch (error) {
                console.log(`Erro ao criar seed de usuario ${error}`);
            }
        }
    } catch (error) {
        return console.log(`Erro ao criar seed, ${error}`);
    }
}
seed().catch((e) => {console.error(e); process.exitCode = 1}).finally(() => sequelize.close())
