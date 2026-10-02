import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Mongoose Models
import User from '../models/User.js';
import Tour from '../models/Tour.js';
import Inquiry from '../models/Inquiry.js';

// Default Curated Tour Catalog
const defaultTours = [
  {
    title: 'The Ultimate Thailand Mega Deal',
    name: 'The Ultimate Thailand Mega Deal',
    destination: 'Thailand',
    duration: '10 Days / 9 Nights',
    price: '31499',
    currency: 'INR',
    pricingUnit: 'per person',
    highlights: ['Space & Time Cube Experience', 'Floating Market', 'Underwater Aquarium'],
    inclusions: ['Hotel Stay', 'Breakfast & Dinner', 'Airport Transfers', 'Guided City Tours'],
    posterImage: '/assets/thailand.jpeg',
    image: '/assets/thailand.jpeg',
    featured: true,
    isFeatured: true,
    isCustomizable: true,
    description: 'Experience the best of Bangkok, Pattaya, and Coral Island with luxury stays, guided sightseeing, and vibrant night markets.',
    itinerary: 'Experience the best of Bangkok, Pattaya, and Coral Island with luxury stays, guided sightseeing, and vibrant night markets.'
  },
  {
    title: 'Dubai Unbeatable Deal',
    name: 'Dubai Unbeatable Deal',
    destination: 'Dubai',
    duration: '5 Days / 4 Nights',
    price: '44999',
    currency: 'INR',
    pricingUnit: 'per person',
    highlights: ['Dhow Cruise Dinner', 'Desert Safari with BBQ Dinner', 'Burj Khalifa Visit'],
    inclusions: ['4-Star Hotel Accommodation', 'Desert Safari & BBQ', 'Burj Khalifa 124th Floor Ticket', 'Airport Transfers'],
    posterImage: '/assets/dubai.jpeg',
    image: '/assets/dubai.jpeg',
    featured: true,
    isFeatured: true,
    isCustomizable: true,
    description: 'Discover luxury, futuristic architecture, and desert adventures in Dubai with seamless airport transfers and 4-star stays.',
    itinerary: 'Discover luxury, futuristic architecture, and desert adventures in Dubai with seamless airport transfers and 4-star stays.'
  },
  {
    title: 'Eastern Himalayan Bliss',
    name: 'Eastern Himalayan Bliss',
    destination: 'Gangtok & Darjeeling',
    duration: '5 Days / 4 Nights',
    price: '40000',
    currency: 'INR',
    pricingUnit: 'per person',
    highlights: ['Private Tour', 'MAP Plan Meals', 'Nathula Pass Excursion'],
    inclusions: ['Premium Mountain Hotel', 'Breakfast & Dinner Included', 'Private Cab Transportation', 'Permits & Sightseeing'],
    posterImage: '/assets/himalayan.jpeg',
    image: '/assets/himalayan.jpeg',
    featured: true,
    isFeatured: true,
    isCustomizable: true,
    description: 'Breathtaking mountain passes, tea estates, and spiritual serenity across Sikkim and West Bengal hills.',
    itinerary: 'Breathtaking mountain passes, tea estates, and spiritual serenity across Sikkim and West Bengal hills.'
  }
];

const seedClientDatabase = async () => {
  // Allow passing the new connection string via CLI argument or env variable
  const targetUri = process.argv[2] || process.env.NEW_MONGO_URI || process.env.MONGODB_CONN || process.env.MONGO_URI;

  if (!targetUri) {
    console.error('Error: Target MongoDB connection string not provided.');
    console.log('Usage: node scripts/seedProductionCluster.js "<YOUR_NEW_MONGODB_URI>"');
    process.exit(1);
  }

  try {
    console.log('Connecting to target MongoDB Atlas cluster...');
    await mongoose.connect(targetUri);
    console.log('Connected successfully to database:', mongoose.connection.name);

    // 1. Seed or Update Admin User
    const adminEmail = 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'PadhamTravels@2026';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Padham Chand',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: '+91 99442 29209'
      });
      console.log(`Created Master Admin Account: ${adminEmail}`);
    } else {
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      await adminUser.save();
      console.log(`Verified and updated existing Admin Account: ${adminEmail}`);
    }

    // 2. Clear any non-admin users if cluster was partially used
    const cleanedUsers = await User.deleteMany({ email: { $ne: adminEmail } });
    console.log(`Purged ${cleanedUsers.deletedCount} non-admin user accounts.`);

    // 3. Populate Default Tours
    const existingTourCount = await Tour.countDocuments();
    if (existingTourCount === 0) {
      await Tour.insertMany(defaultTours);
      console.log(`Successfully seeded ${defaultTours.length} production tour packages.`);
    } else {
      console.log(`Cluster already has ${existingTourCount} tour package(s). Skipping tour overwrite.`);
    }

    // 4. Ensure Inquiries collection is clean
    const inquiryCount = await Inquiry.countDocuments();
    console.log(`Inquiries collection initialized with ${inquiryCount} leads.`);

    console.log('\n--- MIGRATION & SEEDING COMPLETE ---');
    console.log('Admin Login: admin@gmail.com');
    console.log('Role: admin');
    console.log('Tours Count:', await Tour.countDocuments());
    console.log('------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding new MongoDB cluster:', err);
    process.exit(1);
  }
};

seedClientDatabase();
