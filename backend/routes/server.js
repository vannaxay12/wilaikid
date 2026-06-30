require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const app     = express();

const ALLOWED = [
  'http://localhost','http://localhost:80','https://localhost','https://localhost:443',
  'http://localhost:5173','http://127.0.0.1','http://127.0.0.1:5173',
  'https://localhost:5173','https://127.0.0.1:5173',
];
app.use(cors({
  origin: (origin, cb) => (!origin || ALLOWED.includes(origin)) ? cb(null, true) : cb(new Error('Not allowed')),
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',            require('./routes/auth'));
app.use('/api/upload',          require('./routes/upload'));
app.use('/api/customers',       require('./routes/customers'));
app.use('/api/customer-orders', require('./routes/customerOrders'));
app.use('/api/products',        require('./routes/products'));
app.use('/api/categories',      require('./routes/categories'));
app.use('/api/units',           require('./routes/units'));
app.use('/api/suppliers',       require('./routes/suppliers'));
app.use('/api/employees',       require('./routes/employees'));
app.use('/api/sales',           require('./routes/sales'));
app.use('/api/purchases',       require('./routes/purchases'));
app.use('/api/inventory',       require('./routes/inventory'));
app.use('/api/reports',         require('./routes/reports'));

app.get('/api/health', async (_, res) => {
  try { await require('./db').query('SELECT 1'); res.json({ status:'ok', db:'reactnew', time: new Date() }); }
  catch (e) { res.status(500).json({ status:'db_error', message: e.message }); }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀  API → http://localhost:${PORT}/api`));
