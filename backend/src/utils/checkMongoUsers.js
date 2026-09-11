import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { seedInitialData } from './seedData.js';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function seedAndVerifyAtlas() {
  console.log('--- SEEDING & VERIFYING MONGO DB ATLAS ---');
  const uri = process.env.MONGODB_URI;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ MONGO DB CONNECTED SUCCESSFULLY TO ATLAS!');

    await seedInitialData();

    const User = mongoose.connection.db.collection('users');
    const userCount = await User.countDocuments();
    console.log(`\n✅ Total Users Seeded in MongoDB Atlas: ${userCount}`);

    const users = await User.find({}).toArray();
    console.log('\n--- OFFICIAL MUNICIPAL OFFICER & WORKER ACCOUNTS IN MONGO DB ---');
    users.forEach(u => {
      console.log(`- Role: ${u.role} | Email: ${u.email} | EmployeeID: ${u.employeeId} | Dept: ${u.department}`);
    });

  } catch (err) {
    console.error('❌ MONGO DB ERROR:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedAndVerifyAtlas().catch(console.error);
