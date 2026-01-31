const mongoose = require('mongoose');
const AlertRule = require('./src/models/AlertRule');
const Subscription = require('./src/models/Subscription');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Test user ID (use the one from your auth middleware)
    const userId = new mongoose.Types.ObjectId('65d4f5a9e8b7c12345678901');
    
    // Clear existing data
    await AlertRule.deleteMany({});
    await Subscription.deleteMany({});
    
    // Create alert rules
    const alertRules = [
      {
        userId,
        daysBefore: 3,
        channels: ['email', 'in-app'],
        enabled: true,
        notificationTime: '09:00',
        timezone: 'Asia/Kolkata'
      },
      {
        userId,
        daysBefore: 7,
        channels: ['email'],
        enabled: true,
        notificationTime: '09:00',
        timezone: 'Asia/Kolkata'
      }
    ];
    
    await AlertRule.insertMany(alertRules);
    console.log(`✅ Created ${alertRules.length} alert rules`);
    
    // Create sample subscriptions
    const today = new Date();
    const subscriptions = [
      {
        userId,
        name: 'Netflix Premium',
        amount: 649,
        currency: 'INR',
        billingCycle: 'monthly',
        renewalDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days
        status: 'active',
        category: 'entertainment'
      },
      {
        userId,
        name: 'Spotify Family',
        amount: 179,
        currency: 'INR',
        billingCycle: 'monthly',
        renewalDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days
        status: 'active',
        category: 'entertainment'
      }
    ];
    
    await Subscription.insertMany(subscriptions);
    console.log(`✅ Created ${subscriptions.length} subscriptions\n`);
    
    console.log('🎉 Database seeded!');
    console.log('User ID:', userId.toString());
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDatabase();
