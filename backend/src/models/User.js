import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    problemsSolved: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
