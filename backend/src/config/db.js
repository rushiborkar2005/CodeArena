import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Problem } from '../models/Problem.js';

const starterTemplates = {
  'prob-1': {
    c: `#include <stdio.h>\n#include <stdlib.h>\n\n/**\n * Note: The returned array must be malloced, assume caller calls free().\n */\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    // Write your code here\n    *returnSize = 0;\n    return NULL;\n}`,
    cpp: `#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`,
    java: `import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`
  },
  'prob-2': {
    c: `#include <stdbool.h>\n#include <string.h>\n\nbool isValid(char* s) {\n    // Write your code here\n    return false;\n}`,
    cpp: `#include <string>\n\nclass Solution {\npublic:\n    bool isValid(std::string s) {\n        // Write your code here\n        return false;\n    }\n};`,
    java: `import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        // Write your code here\n        return false;\n    }\n}`
  },
  'prob-3': {
    c: `#include <stdio.h>\n#include <string.h>\n\nint lengthOfLongestSubstring(char* s) {\n    // Write your code here\n    return 0;\n}`,
    cpp: `#include <string>\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(std::string s) {\n        // Write your code here\n        return 0;\n    }\n};`,
    java: `import java.util.*;\n\nclass Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your code here\n        return 0;\n    }\n}`
  },
  'prob-4': {
    c: `#include <stdio.h>\n\nint maxArea(int* height, int heightSize) {\n    // Write your code here\n    return 0;\n}`,
    cpp: `#include <vector>\n\nclass Solution {\npublic:\n    int maxArea(std::vector<int>& height) {\n        // Write your code here\n        return 0;\n    }\n};`,
    java: `import java.util.*;\n\nclass Solution {\n    public int maxArea(int[] height) {\n        // Write your code here\n        return 0;\n    }\n}`
  },
  'prob-5': {
    c: `#include <stdio.h>\n#include <stdlib.h>\n\nstruct ListNode* mergeKLists(struct ListNode** lists, int listsSize) {\n    // Write your code here\n    return NULL;\n}`,
    cpp: `#include <vector>\n\nclass Solution {\npublic:\n    ListNode* mergeKLists(std::vector<ListNode*>& lists) {\n        // Write your code here\n        return nullptr;\n    }\n};`,
    java: `import java.util.*;\n\nclass Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        // Write your code here\n        return null;\n    }\n}`
  }
};

const initialProblems = [
  {
    id: 'prob-1',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    acceptanceRate: '49.2%',
    submissions: 15420,
    solvedCount: 7580,
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    sampleInput: 'nums = [2,7,11,15], target = 9',
    sampleOutput: '[0,1]',
    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
      { input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]' }
    ],
    starterTemplates: starterTemplates['prob-1']
  },
  {
    id: 'prob-2',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    acceptanceRate: '40.5%',
    submissions: 12100,
    solvedCount: 4900,
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    sampleInput: 's = "()[]{}"',
    sampleOutput: 'true',
    explanation: 'All brackets are properly closed in sequence.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only `()[]{}`.'
    ],
    testCases: [
      { input: 's = "()[]{}"', expectedOutput: 'true' },
      { input: 's = "(]"', expectedOutput: 'false' },
      { input: 's = "([{}])"', expectedOutput: 'true' }
    ],
    starterTemplates: starterTemplates['prob-2']
  },
  {
    id: 'prob-3',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    acceptanceRate: '33.8%',
    submissions: 28900,
    solvedCount: 9760,
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    sampleInput: 's = "abcabcbb"',
    sampleOutput: '3',
    explanation: 'The answer is "abc", with the length of 3.',
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    testCases: [
      { input: 's = "abcabcbb"', expectedOutput: '3' },
      { input: 's = "bbbbb"', expectedOutput: '1' },
      { input: 's = "pwwkew"', expectedOutput: '3' }
    ],
    starterTemplates: starterTemplates['prob-3']
  },
  {
    id: 'prob-4',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    acceptanceRate: '54.1%',
    submissions: 18400,
    solvedCount: 9950,
    description: 'You are given an integer array `height` of length `n`. Find two lines that together with the x-axis form a container, such that the container contains the most water.',
    sampleInput: 'height = [1,8,6,2,5,4,8,3,7]',
    sampleOutput: '49',
    explanation: 'The vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water the container can contain is 49.',
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    testCases: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', expectedOutput: '49' },
      { input: 'height = [1,1]', expectedOutput: '1' }
    ],
    starterTemplates: starterTemplates['prob-4']
  },
  {
    id: 'prob-5',
    title: 'Merge k Sorted Lists',
    slug: 'merge-k-sorted-lists',
    difficulty: 'Hard',
    category: 'Heap / Priority Queue',
    acceptanceRate: '51.3%',
    submissions: 9200,
    solvedCount: 4720,
    description: 'You are given an array of `k` linked-lists `lists`, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    sampleInput: 'lists = [[1,4,5],[1,3,4],[2,6]]',
    sampleOutput: '[1,1,2,3,4,4,5,6]',
    explanation: 'The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6',
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500'
    ],
    testCases: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', expectedOutput: '[]' }
    ],
    starterTemplates: starterTemplates['prob-5']
  }
];

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        customId: 'usr_demo_1',
        name: 'Alex Mercer',
        username: 'alex_coder',
        email: 'alex@example.com',
        password: hashedPassword,
        role: 'user',
        problemsSolved: 42
      });
      console.log('🌱 Seeded demo user into MongoDB Atlas');
    }

    const problemCount = await Problem.countDocuments();
    if (problemCount === 0) {
      await Problem.insertMany(initialProblems);
      console.log('🌱 Seeded 5 initial coding problems into MongoDB Atlas');
    } else {
      for (const prob of initialProblems) {
        await Problem.updateOne(
          { id: prob.id },
          { $set: { starterTemplates: prob.starterTemplates } }
        );
      }
      console.log('🌱 Updated problem starter templates in MongoDB Atlas');
    }
  } catch (error) {
    console.error('⚠️ Failed to seed initial data:', error.message);
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;


  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.log('ℹ️ MongoDB Atlas connection string is not set in backend/.env.');
    console.log('⚠️ Running in fallback in-memory mode. Replace MONGO_URI in backend/.env with your connection string.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`🍃 MongoDB Atlas Connected: ${conn.connection.host}`);
    await seedDatabase();
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    console.log('⚠️ Running in fallback in-memory mode until connection issue is resolved.');
    return false;
  }
};
