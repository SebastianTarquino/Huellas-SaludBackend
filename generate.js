const fs = require('fs');
const path = require('path');

const baseDir = 'C:/Users/Usuario/Desktop/Huellas_Salud_Backend';

['src/config', 'src/data', 'src/routes', 'src/db', 'uploads'].forEach(dir => {
  fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
});

fs.writeFileSync(path.join(baseDir, 'package.json'), JSON.stringify({
  name: 'huellas-salud-backend',
  version: '1.0.0',
  description: 'Backend API REST para Huellas y Salud (Express + PostgreSQL)',
  main: 'src/index.js',
  scripts: {
    start: 'node src/index.js',
    dev: 'nodemon src/index.js'
  },
  dependencies: {
    bcryptjs: '^2.4.3',
    cors: '^2.8.5',
    dotenv: '^16.4.7',
    express: '^4.21.2',
    jsonwebtoken: '^9.0.2',
    multer: '^1.4.5-lts.1',
    pg: '^8.13.1',
    'swagger-jsdoc': '^6.2.8',
    'swagger-ui-express': '^5.0.1'
  },
  devDependencies: {
    nodemon: '^3.1.9'
  }
}, null, 2));

fs.writeFileSync(path.join(baseDir, '.env'), 'PORT=3000\nJWT_SECRET=super_secret_huellas_salud_key_2026\nDATABASE_URL=\nNODE_ENV=development\n');
fs.writeFileSync(path.join(baseDir, '.gitignore'), 'node_modules\n.env\nuploads/*\n!.gitkeep\n');
fs.writeFileSync(path.join(baseDir, 'uploads/.gitkeep'), '');

fs.writeFileSync(path.join(baseDir, 'src/data/seedData.js'), 
module.exports = {
  users: [
    {
      id: 1,
      documentNumber:  123456789,
      email: admin@huellassalud.com,
      name: Armando,
      lastName: Puentes,
      role: ADMIN,
      password: password123
    },
    {
      id: 2,
      documentNumber: 987654321,
      email: valeria@huellassalud.com,
      name: Valeria,
      lastName: Gómez,
      role: VETERINARIO,
      password: password123
    }
  ],
  pets: [
    {
      idPet: 1,
      name: Max,
      species: Perro,
      sex: Macho,
      age: 4,
      mediaFile: {
        fileName: max.jpg,
        contentType: image/jpeg,
        attachment: 
 },
 medicalHistory: [
 {
 date: 2025-01-15T10:00:00.000Z,
 diagnostic: Chequeo general preventivo - Excelente estado de salud,
 treatment: Desparasitación oral preventiva con Simparica Trio,
 surgeries: [Sin cirugías],
 vaccines: [{ name: Rabia }, { name: Quíntuple Canina }]
 },
 {
 date: 2024-08-10T14:30:00.000Z,
 diagnostic: Leve dermatitis alérgica en patas delanteras,
 treatment: Crema tópica antiséptica + Champú medicado 2 veces por semana,
 surgeries: [Sin cirugías],
 vaccines: [{ name: Parvovirus }]
 }
 ]
 },
 {
 idPet: 2,
 name: Luna,
 species: Gato,
 sex: Hembra,
 age: 2,
 mediaFile: {
 fileName: luna.jpg,
 contentType: image/jpeg,
 attachment: 
      },
      medicalHistory: [
        {
          date: 2025-02-01T11:00:00.000Z,
          diagnostic: Vacunación anual y control de peso,
          treatment: Multivitamínico felino por 15 días,
          surgeries: [Esterilización realizada en 2023],
          vaccines: [{ name: Triple Felina }, { name: Leucemia Felina }]
        }
      ]
    }
  ],
  products: [
    {
      idProduct: 1,
      name: Pro Plan Adulto Razas Medianas 3kg,
      category: Alimento,
      animalType: Perro,
      description: Alimento completo y balanceado para perros adultos de raza mediana con carne de pollo real.,
      price: 85000,
      mediaFile: null
    },
    {
      idProduct: 2,
      name: Juguete Kong Classic Medium,
      category: Juguetes,
      animalType: Perro,
      description: Juguete de caucho súper duradero para rellenar con premios y estimular a tu mascota.,
      price: 45000,
      mediaFile: null
    },
    {
      idProduct: 3,
      name: Bravecto Antipulgas Canino 10-20kg,
      category: Medicinas,
      animalType: Perro,
      description: Comprimido masticable para protección de pulgas y garrapatas durante 12 semanas.,
      price: 120000,
      mediaFile: null
    }
  ],
  invoices: [
    {
      idInvoice: F-146,
      numero: 146,
      idClient: 123456789,
      cliente: Armando Puentes,
      mascota: Max,
      fecha: 15/01/2025,
      monto: 689000,
      estado: Pagada,
      items: [
        { descripcion: Consulta veterinaria general, cantidad: 1, precio: 530000 },
        { descripcion: Bravecto Antipulgas Canino, cantidad: 1, precio: 120000 },
        { descripcion: Pro Plan Adulto Razas Medianas 3kg, cantidad: 1, precio: 85000 }
      ]
    }
  ],
  announcements: [
    {
      idAnnouncement: ann-1,
      description: ¡Gran Jornada de Vacunación este Fin de Semana! Descuentos del 20% en vacunas para perros y gatos.,
      cellPhone: 3001234567,
      status: true,
      nameUserCreated: Dra. Valeria Gómez,
      emailUserCreated: valeria@huellassalud.com,
      roleUserCreated: VETERINARIO
    }
  ]
};
);

fs.writeFileSync(path.join(baseDir, 'src/config/db.js'), 
const { Pool } = require('pg');

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

module.exports = {
  query: (text, params) => {
    if (pool) return pool.query(text, params);
    return Promise.resolve({ rows: [] });
  },
  pool
};
);

fs.writeFileSync(path.join(baseDir, 'src/routes/auth.routes.js'), 
const express = require('express');
const jwt = require('jsonwebtoken');
const seedData = require('../data/seedData');
const router = express.Router();

router.post('/user/login', (req, res) => {
  const { data } = req.body || {};
  const { emailOrDoc, password } = data || {};

  if (!emailOrDoc || !password) {
    return res.status(400).json({ message: 'Se requiere documento/correo y contraseña' });
  }

  const user = seedData.users.find(u => u.email === emailOrDoc || u.documentNumber === emailOrDoc);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales inválidas' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'huellas_secret',
    { expiresIn: '7d' }
  );

  return res.status(200).json({
    token,
    access_token: token,
    data: {
      id: user.id,
      documentNumber: user.documentNumber,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      role: user.role,
      token
    }
  });
});

module.exports = router;
);

fs.writeFileSync(path.join(baseDir, 'src/routes/users.routes.js'), 
const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/user/list-users', (req, res) => {
  const formatted = seedData.users.map(u => ({
    data: {
      name: u.name,
      lastName: u.lastName,
      role: u.role,
      documentNumber: u.documentNumber
    }
  }));
  res.json(formatted);
});

router.get('/user/:id', (req, res) => {
  const user = seedData.users.find(u => u.id == req.params.id || u.documentNumber == req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json(user);
});

router.post('/user/create', (req, res) => {
  const newUser = { id: seedData.users.length + 1, ...req.body };
  seedData.users.push(newUser);
  res.status(201).json({ message: 'Usuario creado exitosamente', data: newUser });
});

module.exports = router;
);

fs.writeFileSync(path.join(baseDir, 'src/routes/pets.routes.js'), 
const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/pet/list-pets', (req, res) => {
  const formatted = seedData.pets.map(p => ({ data: p }));
  res.json(formatted);
});

router.get('/pet/:id', (req, res) => {
  const pet = seedData.pets.find(p => p.idPet == req.params.id);
  if (!pet) return res.status(404).json({ message: 'Mascota no encontrada' });
  res.json({ data: pet });
});

module.exports = router;
);

fs.writeFileSync(path.join(baseDir, 'src/routes/products.routes.js'), 
const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/product/list-products', (req, res) => {
  const formatted = seedData.products.map(p => ({ data: p }));
  res.json(formatted);
});

router.get('/product/:id', (req, res) => {
  const product = seedData.products.find(p => p.idProduct == req.params.id);
  if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
  res.json({ data: product });
});

module.exports = router;
);

fs.writeFileSync(path.join(baseDir, 'src/routes/invoices.routes.js'), 
const express = require('express');
const seedData = require('../data/seedData');
const router = express.Router();

router.get('/invoice/list-invoices', (req, res) => {
  res.json(seedData.invoices);
});

router.get('/invoice/:id', (req, res) => {
  const inv = seedData.invoices.find(i => i.idInvoice == req.params.id || i.numero == req.params.id);
  if (!inv) return res.status(404).json({ message: 'Factura no encontrada' });
  res.json(inv);
});

module.exports = router;
);

fs.writeFileSync(path.join(baseDir, 'src/routes/announcements.routes.js'), 
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const seedData = require('../data/seedData');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get('/announcement/list-announcements', (req, res) => {
  const formatted = seedData.announcements.map(ann => ({
    data: ann,
    meta: {
      nameUserCreated: ann.nameUserCreated,
      emailUserCreated: ann.emailUserCreated,
      roleUserCreated: ann.roleUserCreated
    }
  }));
  res.json(formatted);
});

router.post('/announcement/create', (req, res) => {
  const { data } = req.body || {};
  const newAnn = {
    idAnnouncement: 'ann-' + (seedData.announcements.length + 1),
    description: data?.description || 'Sin descripción',
    cellPhone: data?.cellPhone || '',
    status: true,
    nameUserCreated: 'Usuario',
    emailUserCreated: 'user@huellassalud.com',
    roleUserCreated: 'CLIENTE'
  };
  seedData.announcements.push(newAnn);
  res.status(201).json({ status: 'success', data: newAnn });
});

router.post('/avatar-user/announcement/:id', upload.single('fileUpload'), (req, res) => {
  res.json({ message: 'Imagen subida con éxito', file: req.file });
});

router.get('/avatar-user/Announcement/:id', (req, res) => {
  res.status(404).send('Imagen no encontrada');
});

module.exports = router;
);

fs.writeFileSync(path.join(baseDir, 'src/db/schema.sql'), 
-- Esquema SQL PostgreSQL para Huellas y Salud
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    document_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) DEFAULT 'CLIENTE',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50) NOT NULL,
    sex VARCHAR(20),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medical_history (
    id SERIAL PRIMARY KEY,
    pet_id INT REFERENCES pets(id) ON DELETE CASCADE,
    diagnostic TEXT NOT NULL,
    treatment TEXT,
    surgeries TEXT[],
    vaccines JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    animal_type VARCHAR(50),
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT REFERENCES users(id),
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PAGADA',
    items JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    cell_phone VARCHAR(20),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
);

fs.writeFileSync(path.join(baseDir, 'src/index.js'), 
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
    title: 'Huellas y Salud API',
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
  console.log('🚀 Servidor Huellas y Salud corriendo en el puerto ' + PORT);
  console.log('📖 Documentación Swagger: http://localhost:' + PORT + '/swagger');
  console.log('==================================================');
});
);

console.log('✅ ALL BACKEND FILES GENERATED SUCCESSFULLY!');
