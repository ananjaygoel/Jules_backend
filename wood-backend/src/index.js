const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');

// Route imports
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const feedRoutes = require('./routes/feed');
const tasksRoutes = require('./routes/tasks');
const paymentRoutes = require('./routes/payment');
const searchRoutes = require('./routes/search');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Register routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/search', searchRoutes);

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
