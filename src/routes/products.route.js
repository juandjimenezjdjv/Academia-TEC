import { Router } from 'express';
import { cambiarContrasena, createAcount, enviarCodigo, validarCodigo } from '../controllers/products.controllers.js';
import { crearProfe } from '../controllers/products.controllers.js';
import { getCategorias } from '../controllers/products.controllers.js';
import { loginUser } from '../controllers/products.controllers.js';
import { datosPerfil } from '../controllers/products.controllers.js';
import { cambiardatosPerfil } from '../controllers/products.controllers.js';
import { crearTutoria } from '../controllers/products.controllers.js';
import { obtenerTutorias } from '../controllers/products.controllers.js';
import { obtnerProfesorEmail } from '../controllers/products.controllers.js';
import { obtenerProfesores } from '../controllers/products.controllers.js';
import { insertarMatricula } from '../controllers/products.controllers.js';
import { datosMatricula } from '../controllers/products.controllers.js';
import { enviarInforme } from '../controllers/products.controllers.js';
import sql from 'mssql'

const router = Router();
router.post('/crearUsuario', createAcount);
router.post('/crearProfe', crearProfe);
router.get('/categorias', getCategorias);
router.post('/login', loginUser);
router.post('/obtenerPerfil', datosPerfil);
router.put('/actualizarPerfil', cambiardatosPerfil);
router.post('/crearTutoria', crearTutoria);
router.get('/obtenerTutorias', obtenerTutorias);
router.get("/obtenerProfesor/:correo", obtnerProfesorEmail);
router.get("/obtenerProfesores", obtenerProfesores);

router.post('/enviar_correo_verificacion', enviarCodigo);
router.put("/cambiarContrasena", cambiarContrasena);
router.post('/validar_codigo', validarCodigo);
router.post('/insertarMatricula', insertarMatricula);
router.get('/datosMatricula', datosMatricula);
router.post('/enviarInforme', enviarInforme);

router.post('/registrarPago', async (req, res) => {
    try {
      const { EstudianteCorreo, ImagenComprobanteUrl, FechaPago, Monto, MatriculaID } = req.body;
      await sql.query`
        INSERT INTO Pagos (EstudianteCorreo, ImagenComprobanteUrl, FechaPago, Monto, MatriculaID)
        VALUES (${EstudianteCorreo}, ${ImagenComprobanteUrl}, ${FechaPago}, ${Monto}, ${MatriculaID})`;
      res.send('Pago registrado exitosamente');
    } catch (err) {
      res.status(500).send(err.message);
    }
});
router.get('/obtenerTutoria/:id', async (req, res) => {
try {
        const result = await sql.query`SELECT * FROM Tutoria WHERE TutoriaID = ${req.params.id}`;
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});




export default router;



