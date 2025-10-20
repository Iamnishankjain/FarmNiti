const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Mission = require('../models/Mission');
const Reward = require('../models/Reward');
const Post = require('../models/Post');

dotenv.config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');
    
    // Clear existing data
    await User.deleteMany();
    await Mission.deleteMany();
    await Reward.deleteMany();
    await Post.deleteMany();
    console.log('✅ Cleared existing data');
    
    // Create demo users
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: 'password123',
      phone: '9876543210',
      role: 'authority',
      state: 'Maharashtra',
      district: 'Pune'
    });
    
    const farmerUser = await User.create({
      name: 'Ramesh Kumar',
      email: 'farmer@demo.com',
      password: 'password123',
      phone: '9876543211',
      role: 'farmer',
      village: 'Khardipada',
      district: 'Nashik',
      state: 'Maharashtra',
      xp: 250,
      level: 3,
      greenCoins: 150
    });
    
    console.log('✅ Created demo users');
    
    // Create sample missions
    const missions = await Mission.create([
      {
        title: {
          en: 'Organic Composting',
          hi: 'जैविक खाद बनाना'
        },
        description: {
          en: 'Create organic compost using farm waste and kitchen scraps',
          hi: 'खेत के कचरे और रसोई के स्क्रैप का उपयोग करके जैविक खाद बनाएं'
        },
        category: 'organic',
        difficulty: 'easy',
        season: 'all',
        duration: { value: 7, unit: 'days' },
        rewards: {
          xp: 50,
          greenCoins: 30,
          badge: 'Compost Master'
        },
        createdBy: adminUser._id,
        isActive: true
      },
      {
        title: {
          en: 'Drip Irrigation Setup',
          hi: 'ड्रिप सिंचाई सेटअप'
        },
        description: {
          en: 'Install drip irrigation system to save water and improve crop yield',
          hi: 'पानी बचाने और फसल की उपज बढ़ाने के लिए ड्रिप सिंचाई प्रणाली स्थापित करें'
        },
        category: 'water',
        difficulty: 'medium',
        season: 'all',
        duration: { value: 3, unit: 'days' },
        rewards: {
          xp: 100,
          greenCoins: 75,
          badge: 'Water Saver'
        },
        createdBy: adminUser._id,
        isActive: true
      },
      {
        title: {
          en: 'Soil Health Testing',
          hi: 'मिट्टी स्वास्थ्य परीक्षण'
        },
        description: {
          en: 'Test your soil for pH, NPK levels, and organic matter content',
          hi: 'अपनी मिट्टी का pH, NPK स्तर और जैविक पदार्थ सामग्री के लिए परीक्षण करें'
        },
        category: 'soil',
        difficulty: 'easy',
        season: 'all',
        duration: { value: 1, unit: 'days' },
        rewards: {
          xp: 40,
          greenCoins: 25
        },
        createdBy: adminUser._id,
        isActive: true
      }
    ]);
    
    console.log('✅ Created sample missions');
    
    // Create sample rewards
    await Reward.create([
      {
        title: {
          en: 'Organic Seeds Pack',
          hi: 'जैविक बीज पैक'
        },
        description: {
          en: 'Pack of certified organic vegetable seeds',
          hi: 'प्रमाणित जैविक सब्जी के बीजों का पैक'
        },
        type: 'physical',
        cost: 50,
        stock: 100,
        isActive: true
      },
      {
        title: {
          en: 'Sustainable Farmer Certificate',
          hi: 'सतत किसान प्रमाणपत्र'
        },
        description: {
          en: 'Digital certificate of sustainable farming practices',
          hi: 'सतत कृषि प्रथाओं का डिजिटल प्रमाणपत्र'
        },
        type: 'certificate',
        cost: 100,
        stock: -1,
        isActive: true
      },
      {
        title: {
          en: 'Fertilizer Discount Coupon',
          hi: 'उर्वरक छूट कूपन'
        },
        description: {
          en: '20% discount on organic fertilizer purchase',
          hi: 'जैविक उर्वरक खरीद पर 20% छूट'
        },
        type: 'coupon',
        cost: 75,
        stock: 50,
        isActive: true
      }
    ]);
    
    console.log('✅ Created sample rewards');
    
    // Create sample posts
    await Post.create([
      {
        user: farmerUser._id,
        content: 'Just completed my first composting mission! The organic compost is ready and looks great. Thank you FarmNiti for teaching sustainable practices! 🌾',
        images: [],
        likes: [],
        comments: []
      }
    ]);
    
    console.log('✅ Created sample posts');
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Demo Credentials:');
    console.log('Farmer: farmer@demo.com / password123');
    console.log('Admin: admin@demo.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
