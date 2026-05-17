const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = 'mongodb://localhost:27017/cmsDB';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to local MongoDB');

    // Delete existing user if exists
    await User.deleteOne({ email: 'admin@premed.com' });

    // Create the admin user
    const user = await User.create({
      name: 'Admin',
      email: 'admin@premed.com',
      password: 'password123',
      role: 'admin',
    });

    console.log('Seed success: Admin user created successfully!', user);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
