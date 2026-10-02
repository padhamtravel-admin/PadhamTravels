import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../models/User.js';
import Tour from '../models/Tour.js';

const fullProductionTours = [
  {
    title: 'The Ultimate Thailand Mega Deal',
    name: 'The Ultimate Thailand Mega Deal',
    destination: 'Thailand',
    duration: '10 Days / 9 Nights',
    price: '31499',
    currency: 'INR',
    pricingUnit: 'per person',
    rating: 4.8,
    reviews: 124,
    highlights: ['Space & Time Cube Experience', 'Floating Market', 'Underwater Aquarium'],
    inclusions: ['Hotel Stay', 'Breakfast & Dinner', 'Airport Transfers', 'Guided City Tours'],
    exclusions: ['Visa Fees', 'Personal Expenses', 'Flight Tickets'],
    posterImage: '/assets/thailand.jpeg',
    image: '/assets/thailand.jpeg',
    images: ['/assets/thailand.jpeg'],
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
    rating: 4.9,
    reviews: 98,
    highlights: ['Dhow Cruise Dinner', 'Desert Safari with BBQ Dinner', 'Burj Khalifa Visit'],
    inclusions: ['4-Star Hotel Accommodation', 'Desert Safari & BBQ', 'Burj Khalifa 124th Floor Ticket', 'Airport Transfers'],
    exclusions: ['Tourism Dirham Fee', 'Personal Shopping', 'Flight Tickets'],
    posterImage: '/assets/dubai.jpeg',
    image: '/assets/dubai.jpeg',
    images: ['/assets/dubai.jpeg'],
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
    rating: 4.7,
    reviews: 86,
    highlights: ['Private Tour', 'MAP Plan Meals', 'Nathula Pass Excursion'],
    inclusions: ['Premium Mountain Hotel', 'Breakfast & Dinner Included', 'Private Cab Transportation', 'Permits & Sightseeing'],
    exclusions: ['Entry Fees to Monuments', 'Personal Laundry', 'Train/Air Fare'],
    posterImage: '/assets/himalayan.jpeg',
    image: '/assets/himalayan.jpeg',
    images: ['/assets/himalayan.jpeg'],
    featured: true,
    isFeatured: true,
    isCustomizable: true,
    description: 'Breathtaking mountain passes, tea estates, and spiritual serenity across Sikkim and West Bengal hills.',
    itinerary: 'Breathtaking mountain passes, tea estates, and spiritual serenity across Sikkim and West Bengal hills.'
  },
  {
    title: 'Kerala Gods Own Country Tour',
    name: 'Kerala Gods Own Country Tour',
    destination: 'Kerala (Munnar, Alleppey & Kovalam)',
    duration: '6 Days / 5 Nights',
    price: '28500',
    currency: 'INR',
    pricingUnit: 'per person',
    rating: 4.8,
    reviews: 110,
    highlights: ['Alleppey Houseboat Stay', 'Munnar Tea Gardens & Waterfalls', 'Kovalam Beach Sunset'],
    inclusions: ['Houseboat Stay with All Meals', 'Resort Stay in Munnar', 'Private AC Vehicle', 'Sightseeing & Transfers'],
    exclusions: ['Camera Fees', 'Personal Shopping', 'Airfare/Trainfare'],
    posterImage: '/assets/kerala.jpeg',
    image: '/assets/kerala.jpeg',
    images: ['/assets/kerala.jpeg'],
    featured: true,
    isFeatured: true,
    isCustomizable: true,
    description: 'Relax in green backwaters, pristine beaches, and lush tea plantations of God’s Own Country.',
    itinerary: 'Relax in green backwaters, pristine beaches, and lush tea plantations of God’s Own Country.'
  },
  {
    title: 'Mesmerizing Kashmir Paradise',
    name: 'Mesmerizing Kashmir Paradise',
    destination: 'Srinagar, Gulmarg & Pahalgam',
    duration: '6 Days / 5 Nights',
    price: '34999',
    currency: 'INR',
    pricingUnit: 'per person',
    rating: 4.9,
    reviews: 142,
    highlights: ['Dal Lake Shikara Ride', 'Gulmarg Gondola Ride', 'Pahalgam Valley Exploration'],
    inclusions: ['Dal Lake Houseboat Stay', 'Hotel Stay in Srinagar & Pahalgam', 'Daily Breakfast & Dinner', 'Private Cab Transfers'],
    exclusions: ['Pony Rides', 'Gondola Phase 2 Tickets', 'Flight Tickets'],
    posterImage: '/assets/kashmir.jpeg',
    image: '/assets/kashmir.jpeg',
    images: ['/assets/kashmir.jpeg'],
    featured: true,
    isFeatured: true,
    isCustomizable: true,
    description: 'Immerse yourself in snow-capped mountains, Shikara rides, and scenic valleys of Kashmir.',
    itinerary: 'Immerse yourself in snow-capped mountains, Shikara rides, and scenic valleys of Kashmir.'
  },
  {
    title: 'Serene Bali Island Getaway',
    name: 'Serene Bali Island Getaway',
    destination: 'Bali, Indonesia',
    duration: '7 Days / 6 Nights',
    price: '48999',
    currency: 'INR',
    pricingUnit: 'per person',
    rating: 4.9,
    reviews: 156,
    highlights: ['Tanah Lot Sunset Temple', 'Ubud Swing & Rice Terraces', 'Nusa Penida Island Tour'],
    inclusions: ['Private Villa with Pool Option', 'Daily Breakfast', 'Nusa Penida Speedboat & Tour', 'Airport & Island Transfers'],
    exclusions: ['Visa on Arrival', 'Personal Expenses', 'Flight Tickets'],
    posterImage: '/assets/bali.jpeg',
    image: '/assets/bali.jpeg',
    images: ['/assets/bali.jpeg'],
    featured: true,
    isFeatured: true,
    isCustomizable: true,
    description: 'Experience tropical beaches, lush rice terraces, ancient temples, and vibrant Indonesian culture.',
    itinerary: 'Experience tropical beaches, lush rice terraces, ancient temples, and vibrant Indonesian culture.'
  }
];

const seedPadhamTravels = async () => {
  const targetUri = process.argv[2] || process.env.NEW_MONGO_URI || process.env.MONGODB_CONN || process.env.MONGO_URI;

  if (!targetUri) {
    console.error('Error: MongoDB connection string not provided.');
    console.log('Usage: node scripts/seedPadhamTravelsDatabase.js "<MONGODB_URI>"');
    process.exit(1);
  }

  try {
    console.log('Connecting to target MongoDB Atlas cluster...');
    await mongoose.connect(targetUri);
    const dbName = mongoose.connection.name;
    console.log(`Connected successfully to database: ${dbName}`);

    // --- 1. CONFIGURE ADMIN USERS ---
    const masterEmail = 'info@padhamtravel.com';
    const testAdminEmail = 'admin@gmail.com';

    let masterAdmin = await User.findOne({ email: masterEmail });
    if (masterAdmin) {
      masterAdmin.name = 'Padham Travels';
      masterAdmin.role = 'admin';
      await masterAdmin.save();
      console.log(`Updated Master Admin: ${masterEmail} (Role: admin)`);
    } else {
      const masterHashedPassword = await bcrypt.hash('Padham@2026', 12);
      masterAdmin = await User.create({
        name: 'Padham Travels',
        email: masterEmail,
        password: masterHashedPassword,
        role: 'admin',
        phone: '+91 99442 29209'
      });
      console.log(`Created Master Admin: ${masterEmail} (Role: admin)`);
    }

    let testAdmin = await User.findOne({ email: testAdminEmail });
    const testHashedPassword = await bcrypt.hash('Admin@123', 12);
    if (testAdmin) {
      testAdmin.name = 'Test Admin';
      testAdmin.password = testHashedPassword;
      testAdmin.role = 'admin';
      await testAdmin.save();
      console.log(`Updated Test Admin: ${testAdminEmail} (Role: admin)`);
    } else {
      testAdmin = await User.create({
        name: 'Test Admin',
        email: testAdminEmail,
        password: testHashedPassword,
        role: 'admin'
      });
      console.log(`Created Test Admin: ${testAdminEmail} (Role: admin)`);
    }

    // Purge other accounts
    const purged = await User.deleteMany({ email: { $nin: [masterEmail, testAdminEmail] } });
    console.log(`Purged ${purged.deletedCount} non-whitelisted user accounts.`);

    // --- 2. POPULATE TOURS ---
    await Tour.deleteMany({});
    const insertedTours = await Tour.insertMany(fullProductionTours);
    console.log(`Inserted ${insertedTours.length} tour packages into ${dbName}.tours`);

    // --- 3. FINAL SUMMARY REPORT ---
    const activeUsers = await User.find({}, 'name email role');
    const installedTours = await Tour.find({}, 'name title destination price');

    console.log(`\n==================================================`);
    console.log(` DATABASE SEEDING COMPLETED FOR: [${dbName}]`);
    console.log(`==================================================\n`);

    console.log(`USERS (${activeUsers.length}):`);
    activeUsers.forEach(u => console.log(` - ${u.name} (${u.email}) [Role: ${u.role}]`));

    console.log(`\nTOURS (${installedTours.length}):`);
    installedTours.forEach((t, i) => console.log(` ${i + 1}. ${t.name || t.title} (${t.destination}) - ₹${t.price}`));

    console.log(`\n==================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding padhamtravels database:', error);
    process.exit(1);
  }
};

seedPadhamTravels();
