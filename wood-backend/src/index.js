const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');
const rateLimit = require('express-rate-limit');

// Route imports
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const feedRoutes = require('./routes/feed');
const tasksRoutes = require('./routes/tasks');
const paymentRoutes = require('./routes/payment');
const paymentController = require('./controllers/payment');
const searchRoutes = require('./routes/search');
const referralRoutes = require('./routes/referral');

dotenv.config();

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.set('trust proxy', 1); // Trust first proxy
app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
// Use raw body ONLY for Stripe webhook (must come before express.json for that path)
app.post('/api/payment/stripe-webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

// JSON parsing for all other routes
app.use(express.json());
app.use(express.static('public'));

// Register routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/payment', paymentRoutes); // Note: webhook mounted above with express.raw
app.use('/api/search', searchRoutes);
app.use('/api/referral', referralRoutes);

// Start the server only if this file is run directly
if (require.main === module) {
  connectDB();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
