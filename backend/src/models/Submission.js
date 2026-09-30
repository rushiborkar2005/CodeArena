import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    submissionId: {
      type: String,
      required: true,
      unique: true
    },
    problemId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      index: true
    },
    language: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error', 'Runtime Error', 'Pending'],
      required: true
    },
    runtime: {
      type: String,
      default: '0 ms'
    },
    memory: {
      type: String,
      default: '0 MB'
    },
    passCount: {
      type: String,
      default: '0/0'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
