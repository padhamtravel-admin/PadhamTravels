import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';

const configureAdmins = async () => {
  const targetUri = process.argv[2] || process.env.NEW_MONGO_URI || process.env.MONGODB_CONN || process.env.MONGO_URI;

  if (!targetUri) {
    console.error('Error: MongoDB connection string not provided.');
    console.log('Usage: node scripts/configureAdminsAndCleanUsers.js "<MONGODB_URI>"');
    process.exit(1);
  }

  try {
    console.log('Connecting to target MongoDB Atlas cluster...');
    await mongoose.connect(targetUri);
    console.log('Connected to database:', mongoose.connection.name);

    // 1. Promote or Create Master Admin: info@padhamtravel.com
    const masterEmail = 'info@padhamtravel.com';
    let masterAdmin = await User.findOne({ email: masterEmail });

    if (masterAdmin) {
      masterAdmin.role = 'admin';
      await masterAdmin.save();
      console.log(`Promoted existing user ${masterEmail} to role: 'admin'`);
    } else {
      const defaultMasterPassword = await bcrypt.hash('PadhamTravel@2026', 12);
      masterAdmin = await User.create({
        name: 'Padham Travels',
        email: masterEmail,
        password: defaultMasterPassword,
        role: 'admin',
        phone: '+91 99442 29209'
      });
      console.log(`Created new Master Admin: ${masterEmail} (role: 'admin')`);
    }

    // 2. Configure Test Admin: admin@gmail.com (Password: Admin@123)
    const testAdminEmail = 'admin@gmail.com';
    const testHashedPassword = await bcrypt.hash('Admin@123', 12);

    let testAdmin = await User.findOne({ email: testAdminEmail });
    if (testAdmin) {
      testAdmin.name = 'Test Admin';
      testAdmin.password = testHashedPassword;
      testAdmin.role = 'admin';
      await testAdmin.save();
      console.log(`Updated Test Admin: ${testAdminEmail} with new credentials (role: 'admin')`);
    } else {
      testAdmin = await User.create({
        name: 'Test Admin',
        email: testAdminEmail,
        password: testHashedPassword,
        role: 'admin'
      });
      console.log(`Created Test Admin: ${testAdminEmail} (role: 'admin')`);
    }

    // 3. Purge all other users
    const deleteResult = await User.deleteMany({
      email: { $nin: [masterEmail, testAdminEmail] }
    });
    console.log(`Purged ${deleteResult.deletedCount} non-whitelisted user accounts.`);

    // 4. Verification summary
    const remainingUsers = await User.find({}, 'name email role createdAt');
    console.log('\n--- ACTIVE USER DIRECTORY ---');
    remainingUsers.forEach(u => {
      console.log(`- ${u.name} (${u.email}) -> Role: [${u.role}]`);
    });
    console.log('-----------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error configuring accounts:', error);
    process.exit(1);
  }
};

configureAdmins();
