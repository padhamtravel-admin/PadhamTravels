import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';

const setMasterPassword = async () => {
  const targetUri = process.argv[2] || process.env.MONGODB_CONN || process.env.MONGO_URI;
  const newPassword = process.argv[3] || 'PadhamTravel@2026'; // Default to PadhamTravel@2026

  if (!targetUri) {
    console.error('Missing Mongo connection string.');
    process.exit(1);
  }

  try {
    console.log('Connecting to database...');
    await mongoose.connect(targetUri);
    console.log('Connected to database:', mongoose.connection.name);

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updated = await User.findOneAndUpdate(
      { email: 'info@padhamtravel.com' },
      { 
        name: 'Padham Travels',
        password: hashedPassword, 
        role: 'admin' 
      },
      { new: true, upsert: true }
    );

    console.log(`\nSuccessfully updated ${updated.email}:`);
    console.log(`- Role: ${updated.role}`);
    console.log(`- Password set to: ${newPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
};

setMasterPassword();
