require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / direct server requests
      if (!origin) return callback(null, true);

      const allowed =
        origin === 'http://localhost:3000' ||
        origin.endsWith('.vercel.app');

      if (allowed) {
        return callback(null, true);
      }

      console.log('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Portfolio-wiki API is running. See /api/page-data.',
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || 'Something went wrong on the server.',
  });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});