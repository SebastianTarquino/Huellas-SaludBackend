require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const petsRoutes = require('./routes/pets.routes');
const productsRoutes = require('./routes/products.routes');
const invoicesRoutes = require('./routes/invoices.routes');
const announcementsRoutes = require('./routes/announcements.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Huellas y Salud Client API',
    version: '1.0.0',
    description: 'API REST oficial para la aplicación móvil Huellas y Salud'
  },
  servers: [{ url: 'http://localhost:' + PORT }]
};

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Servidor Backend de Huellas y Salud funcionando correctamente 🐾',
    swagger: 'http://localhost:' + PORT + '/swagger'
  });
});

app.use('/internal', authRoutes);
app.use('/internal', usersRoutes);
app.use('/internal', petsRoutes);
app.use('/internal', productsRoutes);
app.use('/internal', invoicesRoutes);
app.use('/internal', announcementsRoutes);

app.listen(PORT, () => {
  console.log('==================================================');
  console.log('🚀 Servidor Huellas y Salud corriendo en puerto ' + PORT);
  console.log('📖 Swagger UI: http://localhost:' + PORT + '/swagger');
  console.log('==================================================');
});
