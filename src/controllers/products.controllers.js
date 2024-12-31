import { getConnection } from '../database/connection.js'
import sql from 'mssql'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer';

import crypto from 'crypto';

export const createAcount = async(req, res) => {
    const {nombre, apellido, correo, contrasena, interes, rol} = req.body
    console.log("Creando cuenta...")
    try{
        const pool = await getConnection()
        const result = await pool.request()
        .input("nombre", sql.NVarChar, nombre)
        .input("apellido", sql.NVarChar, apellido)
        .input("correo", sql.NVarChar, correo)
        .input("contrasena", sql.NVarChar, contrasena)
        .input("intereses", sql.NVarChar, interes)
        .input("rol", sql.Int, rol)
        .query('insert INTO Estudiantes (Correo, Nombre, Apellido, Contrasena, Intereses, IdRol) values (@correo, @nombre, @apellido, @contrasena, @intereses, @rol)')
        // .query()
        res.send({mensaje: 'Cuenta creada exitosamente'});
        
    } catch (error) {
        console.error('No se creo usuario:', error);
        res.status(500).send({mensaje: 'Error al crear la cuenta'});
    }
    
    console.log('Estudiante creado')

}

export const crearProfe = async (req, res) => {
    const { nombre, apellido, correo, contrasena, interes, rol, profesorDetalles } = req.body;
    console.log("Creando cuenta de profesor...");
    try {
        const pool = await getConnection();
        
        // Insertar datos del profesor en la tabla de Profesores
        await pool.request()
            .input("nombre", sql.NVarChar, nombre)
            .input("apellido", sql.NVarChar, apellido)
            .input("correo", sql.NVarChar, correo)
            .input("contrasena", sql.NVarChar, contrasena)
            .input("intereses", sql.NVarChar, interes)
            .input("rol", sql.Int, rol)
            .input("descripcion", sql.NVarChar, profesorDetalles.descripcion)
            .input("especialidad", sql.NVarChar, profesorDetalles.especialidad)
            .input("lunes", sql.Bit, profesorDetalles.horario.lunes)
            .input("martes", sql.Bit, profesorDetalles.horario.martes)
            .input("miercoles", sql.Bit, profesorDetalles.horario.miercoles)
            .input("jueves", sql.Bit, profesorDetalles.horario.jueves)
            .input("viernes", sql.Bit, profesorDetalles.horario.viernes)
            .input("sabado", sql.Bit, profesorDetalles.horario.sabado)
            .input("horaInicio", sql.NVarChar, profesorDetalles.horario.horaInicio)
            .input("horaFin", sql.NVarChar, profesorDetalles.horario.horaFin)
            .query(`INSERT INTO Tutores (Correo, Nombre, Apellido, Contrasena, Intereses, IdRol, Descripcion, Especialidad, Lunes, Martes, Miercoles, Jueves, Viernes, Sabado, HoraInicio, HoraFin) 
                    VALUES (@correo, @nombre, @apellido, @contrasena, @intereses, @rol, @descripcion, @especialidad, @lunes, @martes, @miercoles, @jueves, @viernes, @sabado, @horaInicio, @horaFin)`);

        res.send({ mensaje: 'Cuenta creada exitosamente' });
    } catch (error) {
        console.error('No se creó usuario:', error);
        res.status(500).send({ mensaje: 'Error al crear la cuenta' });
    }
    console.log('Profesor creado');
};

export const getCategorias = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT intereses, nombreCategoria FROM interes');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).send('Error al obtener categorías');
    }
};

export const loginUser = async (req, res) => {
    const { correo, password, rol } = req.body;
    console.log(req.body);
    const pool = await getConnection();
    try {
        let result = await pool.request()
            .input('correo', sql.VarChar, correo)
            .input('password', sql.VarChar, password)
            .input('rol', sql.Int, rol)
            .query('SELECT * FROM Estudiantes WHERE Correo = @correo AND Contrasena = @password AND IdRol = @rol');
        
        if (result.recordset.length === 0) {
            result = await pool.request()
                .input('correo', sql.VarChar, correo)
                .input('password', sql.VarChar, password)
                .input('rol', sql.Int, rol)
                .query('SELECT * FROM Tutores WHERE Correo = @correo AND Contrasena = @password AND IdRol = @rol');
        }

        if (result.recordset.length > 0) {
            const usuario = result.recordset[0];
            const payload = {
                correo: usuario.Correo,
                password: usuario.Contrasena,
                rol: usuario.IdRol                
            };            
            res.status(200).json({ message: 'Inicio de sesión exitoso', payload: payload});
            console.log("Inicio de sesión exitoso")
        } else {
            console.log("Correo electrónico o contraseña incorrectos")
            res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }
    } catch (error) {
        console.log("Se produjo un error en el inicio de sesión")
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error en el inicio de sesión' });
    }
};

export const datosPerfil = async (req, res) => {
    const { email, rol } = req.body;
    const pool = await getConnection();
    try {
        let query;
        if (rol === 1) {
            query = 'SELECT * FROM Tutores WHERE Correo = @email';
        } else if (rol === 2) {
            query = 'SELECT * FROM Estudiantes WHERE Correo = @email';
        } else {
            return res.status(400).json({ error: 'Rol inválido' });
        }
        const result = await pool.request()
            .input('email', sql.NVarChar, email)
            .query(query);
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Perfil no encontrado' });
        }
        const userProfile = result.recordset[0];
        const formatTime = (time) => {
        const date = new Date(time);
        return date.toISOString().substr(11, 5);
        };
        if (rol === 1) {
            userProfile.HoraInicio = formatTime(userProfile.HoraInicio);
            userProfile.HoraFin = formatTime(userProfile.HoraFin);
        }
        res.json(userProfile);
    } catch (error) {
        console.error('Error al obtener el perfil:', error);
        res.status(500).json({ error: 'Error al obtener el perfil' });
    }
};

export const cambiardatosPerfil = async (req, res) => {
    const { email, rol, nombre, apellido, contrasena, interess, descripcion, especialidad, lunes, martes, miercoles, jueves, viernes, sabado, hora_inicio, hora_fin } = req.body;
    const pool = await getConnection();
    try {
        let query = '';
        if (rol === 1) {
            query = `UPDATE Tutores SET 
                        Nombre = @nombre, 
                        Apellido = @apellido, 
                        Contrasena = @contrasena, 
                        Intereses = @interess, 
                        Descripcion = @descripcion, 
                        Especialidad = @especialidad, 
                        Lunes = @lunes, 
                        Martes = @martes, 
                        Miercoles = @miercoles, 
                        Jueves = @jueves, 
                        Viernes = @viernes, 
                        Sabado = @sabado, 
                        HoraInicio = @hora_inicio, 
                        HoraFin = @hora_fin 
                    WHERE Correo = @correo`;
        } else {
            query = `UPDATE Estudiantes SET 
                        Nombre = @nombre, 
                        Apellido = @apellido, 
                        Contrasena = @contrasena, 
                        Intereses = @interess 
                    WHERE Correo = @correo`;
        }

        const request = pool.request();
        request.input('correo', email);
        request.input('nombre', nombre);
        request.input('apellido', apellido);
        request.input('contrasena', contrasena);
        request.input('interess', interess);
        if (rol === 1) {
            request.input('descripcion', descripcion);
            request.input('especialidad', especialidad);
            request.input('lunes', lunes);
            request.input('martes', martes);
            request.input('miercoles', miercoles);
            request.input('jueves', jueves);
            request.input('viernes', viernes);
            request.input('sabado', sabado);
            request.input('hora_inicio', hora_inicio);
            request.input('hora_fin', hora_fin);
        }
        
        await request.query(query);
        res.json({ message: 'Perfil actualizado' });
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
}

export const crearTutoria = async (req, res) => {
    const { nombreTutoria, correoTutor, enlace, precio, intereses, descripcion, rol } = req.body;
    // Assuming you're using a session middleware to manage sessions
    console.log("Hola que tal")
    if (!rol || rol !== 1) {
        return res.status(403).send({ mensaje: 'Solo los profesores pueden crear una nueva tutoría.' });
    }
    try {
        const pool = await getConnection();
        await pool.request()
            .input('nombreTutoria', sql.NVarChar, nombreTutoria)
            .input('correoTutor', sql.NVarChar, correoTutor)
            .input('enlace', sql.NVarChar, enlace)
            .input('precio', sql.Decimal, precio)
            .input('intereses', sql.Int, intereses)
            .input('descripcion', sql.NVarChar, descripcion)
            .query('INSERT INTO Tutoria (NombreTutoria, CorreoTutor, Enlace, Precio, Intereses, Descripcion) VALUES (@nombreTutoria, @correoTutor, @enlace, @precio, @intereses, @descripcion)');
        res.send({ mensaje: 'Tutoría creada exitosamente' });
    } catch (error) {
        console.error('Error al crear tutoría:', error);
        res.status(500).send({ mensaje: 'Error al crear la tutoría' });
    }
    console.log('Tutoría creada');
}

export const obtenerTutorias = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Tutoria');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener tutorías:', error);
        res.status(500).send('Error al obtener tutorías');
    }
}
export const obtnerProfesorEmail = async (req, res) => {
    const {correo} = req.params
    try {
        const pool = await getConnection();
        const result = await pool.request()
        .input('correo', sql.NVarChar, correo)
        .query('SELECT * FROM Tutores WHERE Correo = @correo')
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error al obtener profesor:', error);
        res.status(500).send('Error al obtener profesor');
    }
}
export const obtenerProfesores = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Tutores');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        res.status(500).send('Error al obtener profesores');
    }
}

async function guardarCodigoVerificacion(email, codigo) {
    try {
        const pool = await getConnection();
        await pool.request()
            .input('email', sql.VarChar, email)
            .input('code', sql.VarChar, codigo)
            .query('INSERT INTO password_resets (email, code) VALUES (@email, @code)');
    } catch (error) {
        console.error('Error al guardar el código de verificación:', error);
    }
}
export const enviarCodigo = async (req, res) => {
    try {
        const { correo } = req.body;
        const respuesta = await fetch('http://localhost:5001/enviar_correo_verificacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: correo
            })
        });
        const resultado = await respuesta.json();

        // Guardar el código de verificación en la base de datos
        await guardarCodigoVerificacion(correo, resultado.codigo_verificacion);

        res.json({ mensaje: resultado.mensaje });
    } catch (error) {
        console.error('Error al enviar el correo electrónico o guardar el código de verificación:', error);
        res.status(500).json({ error: 'Error al enviar el correo electrónico o guardar el código de verificación' });
    }
};
export const validarCodigo = async (req, res) => {
    try {
        const { correo, codigo } = req.body;

        // Verificar si el código de verificación es válido en la base de datos
        const pool = await getConnection();
        const result = await pool.request()
            .input('email', sql.VarChar, correo)
            .input('code', sql.VarChar, codigo)
            .query('SELECT * FROM password_resets WHERE email = @email AND code = @code');
            const respuesta = result.recordset[0];
        if (respuesta) {
            console.log("Codigo correcto")
            res.json({ mensaje: 'El código de verificación es válido' });
        }
        else {
            console.log("Codigo incorrecto")
            res.status(400).json({ error: 'El código de verificación no es válido' });
        }
    } catch (error) {
        console.error('Error al validar el código de verificación:', error);
        res.status(500).json({ error: 'Error al validar el código de verificación' });
    }
};

export const cambiarContrasena = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body)
    try {
        const pool = await getConnection();
        await pool.request()
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query('UPDATE Estudiantes SET Contrasena = @password WHERE Correo = @email');
        res.json({ message: 'Contraseña actualizada' });
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }
}

export const insertarMatricula = async (req, res) => {
    const { TutoriaID, Tutoria, Fecha, Hora, EnlaceClase, EstudianteCorreo, Comprobante, FechaPago, Monto } = req.body;
    console.log(req.body);
    try {
        const pool = await getConnection();

        // Validar que no exista una matrícula con el mismo profesor, hora y fecha
        const result = await pool.request()
            .input('TutoriaID', sql.Int, TutoriaID)
            .input('Fecha', sql.Date, Fecha)
            .input('Hora', sql.NVarChar, Hora)
            .query(`
                SELECT COUNT(*) as count
                FROM Matricula
                WHERE TutoriaID = @TutoriaID AND Fecha = @Fecha AND Hora = @Hora
            `);

        const { count } = result.recordset[0];
        if (count > 0) {
            res.send({ mensaje: 'No se ha matriculado, ya existe una matrícula con el mismo profesor, hora y fecha' });
            return res.status(400).json({ error: 'Ya existe una matrícula con el mismo profesor, hora y fecha' });
        }

        const poool = await getConnection();
        await poool.request()
            .input('TutoriaID', sql.Int, TutoriaID)
            .input('Tutoria', sql.NVarChar, Tutoria)
            .input('Fecha', sql.Date, Fecha)
            .input('Hora', sql.NVarChar, Hora)
            .input('EnlaceClase', sql.NVarChar(100), EnlaceClase)
            .input('EstudianteCorreo', sql.NVarChar(100), EstudianteCorreo)
            .input('Comprobante', sql.NVarChar(100), Comprobante)
            .input('FechaPago', sql.Date, FechaPago)
            .input('Monto', sql.Decimal(10, 2), Monto)
            .query('INSERT INTO Matricula (TutoriaID, NomTutoria, Fecha, Hora, EnlaceClase, EstudianteCorreo, Comprobante, FechaPago, Monto) VALUES (@TutoriaID, @Tutoria, @Fecha, @Hora, @EnlaceClase, @EstudianteCorreo, @Comprobante, @FechaPago, @Monto)');
            res.send({ mensaje: 'Matriculado exitosamente' });
    } catch (error) {
        console.error('Error al registrar la matrícula:', error);
        res.status(500).json({ error: 'Error al registrar la matrícula' });
    }
}

export const datosMatricula = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Matricula');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error al obtener tutorías:', error);
        res.status(500).send('Error al obtener tutorías');
    }
}


export const enviarInforme = async (req, res) => {
    try {
        const { correo, mensajePagos } = req.body;
        const respuesta = await fetch('http://localhost:5002/enviarInforme', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                correo: correo,
                mensajePagos: mensajePagos
            })
        });

        if (!respuesta.ok) {
            const errorText = await respuesta.text();
            throw new Error(`HTTP error! status: ${respuesta.status} - ${errorText}`);
        }

        const resultado = await respuesta.json();
        res.json({ mensaje: resultado.mensaje });
    } catch (error) {
        console.error('Error al enviar el correo electrónico:', error);
        res.status(500).json({ error: 'Error al enviar el correo electrónico o guardar el código de verificación' });
    }
};
