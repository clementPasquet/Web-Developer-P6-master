
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')

// ce plug in nous permet de faire appel a des variables d'environnements pour sécuriser les données sensibles de notre code
require('dotenv').config({ path: process.cwd() + '/.env' });

const sauceRoutes = require('./routes/sauce')
const userRoutes = require('./routes/user')

const app = express()
// helmet permet la protection contre certains type d'attaques
app.use(helmet())

// ce template permet la connexion a la BD
mongoose.connect("mongodb+srv://" +process.env.DB_USER_PASS+ "@cluster0.cbryhjv.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.log('Connexion à MongoDB échouée !' + err));

// cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
})
// routes principales 
app.use(express.json());
app.use('/api/sauces', sauceRoutes)
app.use('/api/auth', userRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))


module.exports = app;