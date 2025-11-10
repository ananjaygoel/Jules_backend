# Wood Backend

A Node.js/Express backend API for managing a content streaming platform with user management, subscriptions, tasks, and payment processing.

## Table of Contents
- [Configuration](#configuration)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Running the Application](#running-the-application)
- [Testing](#testing)

## Configuration

### Configuration Location

The project configuration is defined in **`src/config.js`**. This file contains all the business logic constants and configuration values used throughout the application.

### Configuration Structure

The configuration includes the following settings:

```javascript
{
  episodeFreeLimit: 15,           // Number of free episodes per user
  episodeCost: 30,                // Cost in coins to unlock an episode
  oneTimeTaskMinCoins: 100,       // Minimum coins for one-time tasks
  oneTimeTaskMaxCoins: 300,       // Maximum coins for one-time tasks
  followSocialMediaCoins: 150,    // Coins awarded for social media follows
  dailyAdLimit: 30,               // Maximum ads a user can watch per day
  adRewards: {                    // Tiered ad reward system
    tier1: { limit: 5, coins: 10 },
    tier2: { limit: 10, coins: 20 },
    tier3: { limit: 20, coins: 25 },
    tier4: { limit: 30, coins: 30 }
  },
  spinWheel: {                    // Spin wheel game configuration
    winProbability: 0.9001,       // 90.01% chance to win
    winAmount: 10,                // Default win amount
    jackpotProbability: 0.0001,   // 0.01% chance for jackpot
    jackpotAmount: 100            // Jackpot amount
  },
  subscriptionBonus: 50,          // Bonus coins for active subscribers
  referralLimit: 10               // Maximum number of referrals
}
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wood-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables (see [Environment Variables](#environment-variables))

## Environment Variables

The application requires the following environment variables to be set in your `.env` file:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret API key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `STRIPE_PRICE_ID` | Stripe price ID for subscriptions | Yes |
| `CLIENT_URL` | Frontend application URL | Yes |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase service account credentials (JSON) | Yes |
| `PORT` | Server port (default: 3000) | No |

### Example `.env` file:
```env
MONGO_URI="mongodb://localhost:27017/wood-backend"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."
CLIENT_URL="http://localhost:3000"
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
PORT=3000
```

## API Endpoints

### User Routes (`/api/user`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile

### Admin Routes (`/api/admin`)
- `POST /series` - Create a new series
- `POST /episode` - Create a new episode
- `POST /coupon` - Create a coupon
- `PUT /series/:id` - Update a series
- `DELETE /series/:id` - Delete a series

### Feed Routes (`/api/feed`)
- `GET /` - Get content feed
- `POST /unlock/:episodeId` - Unlock an episode

### Tasks Routes (`/api/tasks`)
- `POST /complete-profile` - Complete user profile
- `POST /watch-ad` - Watch an ad
- `POST /spin-wheel` - Spin the wheel
- `POST /refer` - Refer a friend
- `POST /follow-social` - Follow on social media

### Payment Routes (`/api/payment`)
- `POST /create-checkout-session` - Create Stripe checkout session
- `POST /webhook` - Stripe webhook endpoint

### Search Routes (`/api/search`)
- `GET /` - Search content

## Running the Application

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## Testing

Run the test suite:
```bash
npm test
```

The project uses Jest for testing with:
- Unit tests for API endpoints
- MongoDB Memory Server for in-memory database testing
- Supertest for HTTP endpoint testing

## Project Structure

```
wood-backend/
├── src/
│   ├── config.js          # Application configuration (see above)
│   ├── db.js              # Database connection
│   ├── index.js           # Express app entry point
│   ├── controllers/       # Request handlers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── helpers/           # Helper functions
├── __tests__/             # Test files
├── public/                # Static files
├── scripts/               # Utility scripts
├── .env.example           # Example environment variables
└── package.json           # Project dependencies
```

## Admin Management

To assign admin role to a user:
```bash
npm run assign-admin
```

Follow the prompts to enter the user's Firebase UID.

## Security Features

- Firebase authentication integration
- Role-based access control (Admin/User)
- Rate limiting (100 requests per 15 minutes)
- Stripe webhook signature verification
- Input validation using Joi

## License

ISC
