require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '', // XAMPP default = no password
    database: process.env.DB_NAME || 'reactnew',
    waitForConnections: true,
    connectionLimit: 10,
    charset: 'utf8mb4',
    timezone: '+07:00', // Bangkok time
});

// Test connection on startup
pool.getConnection()
    .then(conn => {
        console.log('✅  MySQL connected → reactnew @ 127.0.0.1:3306');
        conn.release();
    })
    .catch(err => {
        console.error('❌  MySQL connection failed:', err.message);
        console.error('    ຕວດສອບ: XAMPP → Start MySQL, database ຊື່ "reactnew" ຕ້ອງມີຢູ່');
    });

module.exports = pool;