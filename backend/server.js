const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'eshop_db'
});

db.connect((err) => {
    if (err) console.error('Error al conectar a MySQL:', err.message);
    else console.log('✅ Conexión exitosa a la Base de Datos MySQL');
});

// Ruta para obtener productos
app.get('/api/productos', (req, res) => {
    const query = 'SELECT p.*, c.nombre AS categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id = c.id';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Ruta para registrar ventas, actualizar stock y simular envío de factura por correo
app.post('/api/ventas', (req, res) => {
    const { usuario_id, total, correo, whatsapp, empresaEnvio, items } = req.body;
    
    const queryVenta = 'INSERT INTO ventas (usuario_id, total) VALUES (?, ?)';
    
    db.query(queryVenta, [usuario_id || 1, total], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Actualizar stock de cada producto comprado
        items.forEach(item => {
            db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.id]);
        });

        // Simulación interna del envío de factura digital al correo del cliente
        console.log(`\n========================================`);
        console.log(`📧 [FACTURA DIGITAL ENVIADA]`);
        console.log(`Destinatario: ${correo}`);
        console.log(`Teléfono WhatsApp: ${whatsapp}`);
        console.log(`Courier seleccionado: ${empresaEnvio}`);
        console.log(`Monto Total: Q ${Number(total).toFixed(2)}`);
        console.log(`========================================\n`);

        res.json({ message: 'Venta registrada y factura enviada con éxito' });
    });
});

app.listen(5000, () => {
    console.log('🚀 Servidor corriendo en http://localhost:5000');
});