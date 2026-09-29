import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'atf_online_judge_secret_key_2026';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await userModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User account no longer exists' });
      }

      req.user = userModel.toPublicProfile(user);
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
