import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'atf_online_judge_secret_key_2026';

// Fallback in-memory data store
const inMemoryUsers = [];

// Seed demo user for in-memory mode
const seedDemoUser = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  inMemoryUsers.push({
    id: 'usr_demo_1',
    name: 'Alex Mercer',
    username: 'alex_coder',
    email: 'alex@example.com',
    password: hashedPassword,
    role: 'user',
    problemsSolved: 42,
    createdAt: new Date().toISOString()
  });
};
seedDemoUser();

const isDBConnected = () => mongoose.connection.readyState === 1;

const formatUserObj = (userDoc) => {
  if (!userDoc) return null;
  const obj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  obj.id = obj._id ? obj._id.toString() : obj.customId || obj.id;
  return obj;
};

export const userModel = {
  /**
   * Find user by email address
   */
  findByEmail: async (email) => {
    if (isDBConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      return formatUserObj(user);
    }
    return inMemoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  /**
   * Find user by ID
   */
  findById: async (id) => {
    if (isDBConnected()) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        user = await User.findById(id);
      }
      if (!user) {
        user = await User.findOne({ customId: id });
      }
      return formatUserObj(user);
    }
    return inMemoryUsers.find((u) => u.id === id) || null;
  },

  /**
   * Find user by username
   */
  findByUsername: async (username) => {
    if (isDBConnected()) {
      const user = await User.findOne({ username: username.toLowerCase() });
      return formatUserObj(user);
    }
    return inMemoryUsers.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
  },

  /**
   * Create new user
   */
  create: async ({ name, username, email, password }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (isDBConnected()) {
      const customId = `usr_${Date.now()}`;
      const newUser = await User.create({
        customId,
        name,
        username,
        email,
        password: hashedPassword,
        role: 'user',
        problemsSolved: 0
      });
      return formatUserObj(newUser);
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      username,
      email,
      password: hashedPassword,
      role: 'user',
      problemsSolved: 0,
      createdAt: new Date().toISOString()
    };

    inMemoryUsers.push(newUser);
    return newUser;
  },

  /**
   * Verify password against hash
   */
  comparePassword: async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },

  /**
   * Generate JWT Token
   */
  generateToken: (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
  },

  /**
   * Sanitize user object (exclude password)
   */
  toPublicProfile: (user) => {
    if (!user) return null;
    const { password, _id, __v, ...publicUser } = user;
    return publicUser;
  }
};
