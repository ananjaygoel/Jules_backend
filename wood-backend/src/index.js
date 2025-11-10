const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const rateLimit = require('express-rate-limit');

// Route imports
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const feedRoutes = require('./routes/feed');
const tasksRoutes = require('./routes/tasks');
const paymentRoutes = require('./routes/payment');
const searchRoutes = require('./routes/search');

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(express.json());
app.use(express.static('public'));

// Register routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/search', searchRoutes);

// Start the server only if this file is run directly
if (require.main === module) {
  connectDB();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
