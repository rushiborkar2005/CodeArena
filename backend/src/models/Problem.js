import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' }
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    acceptanceRate: {
      type: String,
      default: '50.0%'
    },
    submissions: {
      type: Number,
      default: 0
    },
    solvedCount: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: true
    },
    sampleInput: {
      type: String,
      default: ''
    },
    sampleOutput: {
      type: String,
      default: ''
    },
    explanation: {
      type: String,
      default: ''
    },
    constraints: [{ type: String }],
    testCases: [testCaseSchema],
    starterTemplates: {
      c: { type: String, default: '' },
      cpp: { type: String, default: '' },
      java: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

export const Problem = mongoose.models.Problem || mongoose.model('Problem', problemSchema);
