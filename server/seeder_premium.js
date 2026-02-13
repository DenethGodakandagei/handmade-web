import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/UserModel.js';
import Category from './models/CategoryModel.js';
import Product from './models/ProductModel.js';

dotenv.config();

const users = [
  {
    name: 'Admin Guardian',
    email: 'admin@artisan.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Aruna Master Potter',
    email: 'aruna@artisan.com',
    password: 'password123',
    role: 'artisan'
  }
];

const categories = [
  { name: 'Ceramic Lineage', description: 'Ancestral clay works from the iron-rich mahogany valleys.' },
  { name: 'Textile Heritage', description: 'Hand-loomed silks dyed with crushed pomegranate and indigo.' },
  { name: 'Sacred Metal', description: 'Lost-wax casting traditions from the southern shrines.' }
];

const products = [
  {
    name: 'The Obsidian Vessel',
    description: 'A masterfully crafted artifact that embodies the centuries-old heritage of the central highlands. Using only locally sourced organic materials, each element is formed by hand over forty-eight hours. The deep obsidian finish is achieved through a unique double-firing process in subterranean pits.',
    price: 450,
    stock: 5,
    images: ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800'],
    location: { district: 'Kandy', area: 'Highlands' },
    averageRating: 4.9
  },
  {
    name: 'Indigo Nomad Wrap',
    description: 'Sustainably sourced highland wool, double-dyed in wild fermented indigo for over 3 months. Each pattern is a topographical map of the weaver’s ancestral lands. A piece of wearable geography.',
    price: 320,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1520006403993-474000b67473?auto=format&fit=crop&q=80&w=800'],
    location: { district: 'Jaffna', area: 'Coastal Palms' },
    averageRating: 5.0
  },
  {
    name: 'Shrine Bronze Bell',
    description: 'Traditional Gamelan metalwork passed down through 5 generations. The resonance frequency is tuned specifically to the mid-morning prayers of the southern coast shrines. Hand-polished with sand and citrus.',
    price: 180,
    stock: 3,
    images: ['https://images.unsplash.com/photo-1596450514735-37321531853d?auto=format&fit=crop&q=80&w=800'],
    location: { district: 'Galle', area: 'Old Fort' },
    averageRating: 4.8
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    // Seed Users
    const salt = await bcrypt.genSalt(12);
    const hashedUsers = await Promise.all(users.map(async u => ({
      ...u,
      password: await bcrypt.hash(u.password, salt)
    })));
    const createdUsers = await User.insertMany(hashedUsers);
    
    // Seed Categories
    const createdCategories = await Category.insertMany(categories);

    // Seed Products
    const artisan = createdUsers.find(u => u.role === 'artisan');
    const enrichedProducts = products.map((p, i) => ({
      ...p,
      artisan: artisan._id,
      category: createdCategories[i % createdCategories.length]._id
    }));
    await Product.insertMany(enrichedProducts);

    console.log('Premium Data Seeded Successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
