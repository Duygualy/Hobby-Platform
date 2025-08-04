const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('API is working 👑');
});


const authRoutes = require('./routes/auth');
const avatarRoutes = require('./routes/avatar');
const hobbyRoutes = require('./routes/hobby');
const progressRoutes = require('./routes/progress');

app.use('/api/hobby', hobbyRoutes)
app.use('/api/avatar', avatarRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('💚 MongoDB bağlantısı başarılı');
  app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda çalışıyor`));
})
.catch((err) => console.error('❌ MongoDB bağlantı hatası:', err));
