# Wood Backend

A Node.js backend for the Wood microdrama platform.

## Features
- User authentication with Firebase
- Series and episode management
- Coin-based episode access
- Coin generation tasks
- Payments with Stripe
- Video hosting with FastPix.io

## Setup
1. Install dependencies: `npm install`
2. Set up environment variables in `.env` (copy from `.env.example`)
3. Start MongoDB and run `npm run dev`

## FastPix Integration
- Get API key from FastPix dashboard.
- Set `FASTPIX_API_KEY` in `.env`.
- Episodes are uploaded to FastPix on creation via admin API.
- Videos are streamed from FastPix URLs.

## API Endpoints
- `/api/user`: User management
- `/api/feed`: Home feed and episodes
- `/api/tasks`: Coin tasks
- `/api/admin`: Admin operations (requires admin role)
- `/api/payment`: Stripe payments
- `/api/search`: Search series

## Admin Panel
- Access at `/api/admin` (admin auth required)
- Upload videos via POST `/api/admin/episodes` with `video` file and `series`, `episodeNumber`.