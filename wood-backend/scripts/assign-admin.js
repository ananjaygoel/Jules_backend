// scripts/assign-admin.js
const mongoose = require('mongoose');
const User = require('../src/models/user');
const dotenv = require('dotenv');

dotenv.config();

const assignAdmin = async () => {
  if (process.argv.length < 3) {
    console.error('Please provide a user email address.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);

  const email = process.argv[2];
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });

  if (user) {
    console.log(`Successfully assigned admin role to ${user.email}`);
  } else {
    console.error(`User with email ${email} not found.`);
  }

  await mongoose.connection.close();
};

assignAdmin();
