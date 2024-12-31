import mssql from 'mssql';
import dotenv from 'dotenv'; 
dotenv.config()
const dbSettings = {
    
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

export const getConnection = async () => {
    try {
        console.log(process.env.DB_USER)
        console.log("Se ha conectado a la base de datos")
        const pool = await mssql.connect(dbSettings)
        return pool
    } catch (error) {
        console.error(error)
    }
}

