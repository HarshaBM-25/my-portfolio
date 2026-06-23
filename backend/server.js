require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

// Serve uploaded photos / resume files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Portfolio-wiki API is running. See /api/page-data.' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
