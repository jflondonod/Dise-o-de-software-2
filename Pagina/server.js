const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexión PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'soporte_tecnico_db',
    password: '1234', // Corregido aquí (password con dos 's')
    port: 5432,
});

// Recibe tabla de formulario
app.post('/api/reportes', async (req, res) => {
    const { nombre, identificacion, correo, telefono, tipo_dispositivo, descripcion } = req.body;
    
    try {
        const query = `
            INSERT INTO tickets_soporte 
            (nombre_completo, identificacion, correo_electronico, telefono, tipo_dispositivo, descripcion_problema) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
        
        const values = [nombre, identificacion, correo, telefono, tipo_dispositivo, descripcion];
        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: '¡Reporte guardado exitosamente en PostgreSQL!',
            ticket: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Hubo un error al guardar el reporte en la base de datos.'
        });
    }
});

// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor backend corriendo en http://localhost:3000');
});