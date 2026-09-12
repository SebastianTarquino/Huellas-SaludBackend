
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
    description: 'API REST oficial completa (CRUD) para la aplicación móvil Huellas y Salud'
  },
  servers: [
    { url: 'http://localhost:' + PORT, description: 'Servidor Local' },
    { url: 'https://huellas-saludbackend.onrender.com', description: 'Servidor de Producción (Render)' }
  ],
  paths: {
    // AUTH
    '/internal/user/login': {
      post: {
        tags: ['Autenticación'],
        summary: 'POST: Iniciar Sesión (Login)',
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
        responses: { '200': { description: 'Login exitoso con Token JWT' }, '401': { description: 'Credenciales inválidas' } }
      }
    },
    // USERS
    '/internal/user/list-users': {
      get: { tags: ['Usuarios'], summary: 'GET: Listar todos los Usuarios', responses: { '200': { description: 'Lista de usuarios' } } }
    },
    '/internal/user/{id}': {
      get: {
        tags: ['Usuarios'],
        summary: 'GET: Obtener Usuario por ID o Documento',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Detalles del usuario' }, '404': { description: 'No encontrado' } }
      },
      put: {
        tags: ['Usuarios'],
        summary: 'PUT: Actualizar Usuario',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, lastName: { type: 'string' }, role: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'Usuario actualizado' } }
      },
      delete: {
        tags: ['Usuarios'],
        summary: 'DELETE: Eliminar Usuario',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Usuario eliminado' } }
      }
    },
    '/internal/user/create': {
      post: {
        tags: ['Usuarios'],
        summary: 'POST: Crear Nuevo Usuario',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  documentNumber: { type: 'string', example: '555666777' },
                  email: { type: 'string', example: 'nuevo@correo.com' },
                  name: { type: 'string', example: 'Carlos' },
                  lastName: { type: 'string', example: 'Mendoza' },
                  role: { type: 'string', example: 'CLIENTE' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Usuario creado' } }
      }
    },
    // PETS
    '/internal/pet/list-pets': {
      get: { tags: ['Mascotas'], summary: 'GET: Listar Mascotas', responses: { '200': { description: 'Lista de mascotas' } } }
    },
    '/internal/pet/{id}': {
      get: {
        tags: ['Mascotas'],
        summary: 'GET: Detalle e Historial Médico de Mascota',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Detalle de mascota e historial' } }
      },
      put: {
        tags: ['Mascotas'],
        summary: 'PUT: Actualizar Datos de Mascota',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, age: { type: 'integer' } } } } } },
        responses: { '200': { description: 'Mascota actualizada' } }
      },
      delete: {
        tags: ['Mascotas'],
        summary: 'DELETE: Eliminar Mascota',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Mascota eliminada' } }
      }
    },
    '/internal/pet/create': {
      post: {
        tags: ['Mascotas'],
        summary: 'POST: Registrar Nueva Mascota',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { name: { type: 'string', example: 'Rocky' }, species: { type: 'string', example: 'Perro' }, sex: { type: 'string', example: 'Macho' }, age: { type: 'integer', example: 3 } }
              }
            }
          }
        },
        responses: { '201': { description: 'Mascota registrada' } }
      }
    },
    // PRODUCTS
    '/internal/product/list-products': {
      get: { tags: ['Productos'], summary: 'GET: Listar Productos', responses: { '200': { description: 'Lista de productos' } } }
    },
    '/internal/product/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'GET: Detalle de Producto por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Detalles del producto' } }
      },
      put: {
        tags: ['Productos'],
        summary: 'PUT: Actualizar Producto con Imagen o Datos',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Pro Plan Adulto Razas Medianas 3kg' },
                  category: { type: 'string', example: 'Alimento' },
                  animalType: { type: 'string', example: 'Perro' },
                  price: { type: 'number', example: 85000 },
                  description: { type: 'string', example: 'Alimento completo y balanceado con pollo' },
                  mediaFile: {
                    type: 'object',
                    properties: {
                      fileName: { type: 'string', example: 'producto.jpg' },
                      contentType: { type: 'string', example: 'image/jpeg' },
                      attachment: { type: 'string', example: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&auto=format&fit=crop&q=80' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Producto actualizado exitosamente' } }
      },
      delete: {
        tags: ['Productos'],
        summary: 'DELETE: Eliminar Producto',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Producto eliminado' } }
      }
    },
    '/internal/product/create': {
      post: {
        tags: ['Productos'],
        summary: 'POST: Crear Nuevo Producto',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Shampoo Canino Antiséptico' },
                  category: { type: 'string', example: 'Higiene' },
                  animalType: { type: 'string', example: 'Perro' },
                  price: { type: 'number', example: 35000 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Producto creado' } }
      }
    },
    // INVOICES
    '/internal/invoice/list-invoices': {
      get: { tags: ['Facturas'], summary: 'GET: Listar Facturas', responses: { '200': { description: 'Lista de facturas' } } }
    },
    '/internal/invoice/{id}': {
      get: {
        tags: ['Facturas'],
        summary: 'GET: Detalle de Factura por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Detalles de la factura' } }
      },
      put: {
        tags: ['Facturas'],
        summary: 'PUT: Actualizar Estado de Factura',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { estado: { type: 'string', example: 'ANULADA' } } } } } },
        responses: { '200': { description: 'Factura actualizada' } }
      }
    },
    '/internal/invoice/create': {
      post: {
        tags: ['Facturas'],
        summary: 'POST: Generar Nueva Factura',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cliente: { type: 'string', example: 'Armando Puentes' },
                  mascota: { type: 'string', example: 'Max' },
                  monto: { type: 'number', example: 150000 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Factura creada' } }
      }
    },
    // ANNOUNCEMENTS
    '/internal/announcement/list-announcements': {
      get: { tags: ['Anuncios'], summary: 'GET: Listar Anuncios', responses: { '200': { description: 'Lista de anuncios' } } }
    },
    '/internal/announcement/create': {
      post: {
        tags: ['Anuncios'],
        summary: 'POST: Crear Anuncio',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: { description: { type: 'string', example: 'Jornada de Adopción' }, cellPhone: { type: 'string', example: '3009998877' } }
                  }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Anuncio creado' } }
      }
    },
    '/internal/announcement/{id}': {
      put: {
        tags: ['Anuncios'],
        summary: 'PUT: Actualizar Anuncio',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { description: { type: 'string' } } } } } },
        responses: { '200': { description: 'Anuncio actualizado' } }
      },
      delete: {
        tags: ['Anuncios'],
        summary: 'DELETE: Eliminar Anuncio',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Anuncio eliminado' } }
      }
    }
  }
};

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
