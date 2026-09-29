import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'atf_online_judge_secret_key_2026';

// In-memory data store for users
const users = [];

// Seed an initial demo user
const seedDemoUser = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  users.push({
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

export const userModel = {
  /**
   * Find user by email address
   */
  findByEmail: async (email) => {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  /**
   * Find user by ID
   */
  findById: async (id) => {
    return users.find((u) => u.id === id);
  },

  /**
   * Find user by username
   */
  findByUsername: async (username) => {
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  },

  /**
   * Create new user
   */
  create: async ({ name, username, email, password }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    users.push(newUser);
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
    const { password, ...publicUser } = user;
    return publicUser;
  }
};
