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
  servers: [{ url: 'http://localhost:' + PORT }],
  paths: {
    '/internal/user/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'Iniciar Sesión de Usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      emailOrDoc: { type: 'string', example: '123456789' },
                      password: { type: 'string', example: 'password123' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Login exitoso con Token JWT' },
          '401': { description: 'Credenciales inválidas' }
        }
      }
    },
    '/internal/user/list-users': {
      get: {
        tags: ['Usuarios'],
        summary: 'Listar todos los Usuarios',
        responses: { '200': { description: 'Lista de usuarios registrados' } }
      }
    },
    '/internal/pet/list-pets': {
      get: {
        tags: ['Mascotas'],
        summary: 'Listar Mascotas e Historial Médico',
        responses: { '200': { description: 'Lista de mascotas' } }
      }
    },
    '/internal/pet/{id}': {
      get: {
        tags: ['Mascotas'],
        summary: 'Detalle e Historial Médico de una Mascota',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Información detallada de la mascota' } }
      }
    },
    '/internal/product/list-products': {
      get: {
        tags: ['Productos'],
        summary: 'Listar Productos y Medicamentos',
        responses: { '200': { description: 'Catálogo de productos' } }
      }
    },
    '/internal/invoice/list-invoices': {
      get: {
        tags: ['Facturas'],
        summary: 'Listar Facturas Registradas',
        responses: { '200': { description: 'Lista de facturas' } }
      }
    },
    '/internal/announcement/list-announcements': {
      get: {
        tags: ['Anuncios'],
        summary: 'Listar Anuncios Públicos',
        responses: { '200': { description: 'Lista de anuncios' } }
      }
    },
    '/internal/announcement/create': {
      post: {
        tags: ['Anuncios'],
        summary: 'Crear un Nuevo Anuncio',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      description: { type: 'string', example: 'Jornada de vacunación canina' },
                      cellPhone: { type: 'string', example: '3001234567' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Anuncio creado exitosamente' } }
      }
    }
  }
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
