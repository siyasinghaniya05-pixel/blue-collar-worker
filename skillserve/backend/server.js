const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { seedIfEmpty } = require('./seed');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const start = async () => {
  try {
    await connectDB();
    await seedIfEmpty();
  } catch (error) {
    console.error('Startup error:', error.message);
    process.exit(1);
  }
};

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SkillServe API is running', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SkillServe server running on port ${PORT}`);
});

start();
