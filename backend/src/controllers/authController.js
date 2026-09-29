import { userModel } from '../models/userModel.js';

/**
 * @desc   Register a new coder account
 * @route  POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, username, email, password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email address already exists' });
    }

    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const user = await userModel.create({ name, username, email, password });
    const token = userModel.generateToken(user.id);
    const publicProfile = userModel.toPublicProfile(user);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: publicProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Authenticate coder & get JWT token
 * @route  POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await userModel.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = userModel.generateToken(user.id);
    const publicProfile = userModel.toPublicProfile(user);

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: publicProfile
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current logged in user details
 * @route  GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
