// scripts/assign-admin.js
const mongoose = require('mongoose');
const User = require('../src/models/user');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const assignAdmin = async () => {
  if (process.argv.length < 3) {
    console.error('Please provide a user email address.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const email = process.argv[2];
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });

  if (user) {
    await admin.auth().setCustomUserClaims(user.firebaseUid, { role: 'admin' });
    console.log(`Successfully assigned admin role to ${user.email}`);
  } else {
    console.error(`User with email ${email} not found.`);
  }

  await mongoose.connection.close();
};

assignAdmin();
