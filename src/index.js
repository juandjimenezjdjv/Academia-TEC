
import app from './app.js'
import {getConnection} from './database/connection.js'

getConnection()
app.listen(1434)

console.log("Conexion ...")

