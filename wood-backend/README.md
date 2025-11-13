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

### Dev mock auth
If Firebase Admin isn’t configured, the server runs in mock-auth mode and accepts requests as an authenticated user. You can select which mock user UID to use by sending an `x-mock-uid` header (defaults to a built-in demo UID). The mobile client uses this to align the registered user with the authenticated user during development.

## FastPix Integration
- Get API key from FastPix dashboard.
- Set `FASTPIX_API_KEY` in `.env`.
- Episodes are uploaded to FastPix on creation via admin API.
- Videos are streamed from FastPix URLs.

## API Endpoints
- `/api/user`: User management
- `/api/feed`: Home feed and episodes
- `/api/feed/episode/:id/peek` (GET, auth): Check unlock status without side effects. Returns one of: `free`, `unlocked`, `can_unlock`, `insufficient_coins`, `previous_locked` with `coins`, `cost`, and `previousEpisodeId` when applicable.
- `/api/feed/episode/:id/unlock` (POST, auth): Explicitly unlock a paid episode (idempotent). Errors: 403 previous locked, 402 insufficient coins. On success returns `{ unlocked: true, coins }`.
- `/api/tasks`: Coin tasks
- `/api/admin`: Admin operations (requires admin role)
- `/api/payment`: Stripe payments
- `/api/search`: Search series

## Admin Panel
- Access at `/api/admin` (admin auth required)
- Upload videos via POST `/api/admin/episodes` with `video` file and `series`, `episodeNumber`.