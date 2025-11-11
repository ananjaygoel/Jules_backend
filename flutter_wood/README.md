# Wood Flutter App

A microdrama platform app built with Flutter, connected to a Node.js backend.

## Features
- User authentication with Firebase
- Home feed with series thumbnails
- Episode viewing with coin payments
- Coin generation tasks (one-time, daily ads, spin wheel)
- User profile management
- Search functionality
- Black theme for Gen Z

## Setup
1. Ensure Flutter is installed: `flutter doctor`
2. Add Firebase to your project: Follow https://firebase.google.com/docs/flutter/setup
3. Update `lib/services/api_service.dart` baseUrl to your backend URL.
4. Run `flutter pub get`
5. Run `flutter run`

## Backend Connection
The app connects to the backend at `http://localhost:3000`. Ensure the backend is running and configured as per the backend README.

## Additional Functionality Added
- Error handling for API calls
- Loading states
- Snackbar notifications
- Basic video URL display (integrate a video player for full functionality)
- Subscription and payment intents (basic setup, integrate Stripe SDK for full payments)