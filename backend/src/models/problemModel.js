import mongoose from 'mongoose';
import { Problem } from './Problem.js';
import { Submission } from './Submission.js';

// Starter templates for compiler engine
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
  }
};

// Fallback in-memory problems array
const inMemoryProblems = [
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  }
];

const inMemorySubmissions = {};

const isDBConnected = () => mongoose.connection.readyState === 1;

export const problemModel = {
  findAll: async ({ category, difficulty, search }) => {
    if (isDBConnected()) {
      const query = {};
      if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      }
      if (difficulty) {
        query.difficulty = { $regex: new RegExp(`^${difficulty}$`, 'i') };
      }
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      const problems = await Problem.find(query).lean();
      return problems.map(p => ({ ...p, id: p.id || p._id.toString() }));
    }

    let result = [...inMemoryProblems];
    if (category) {
      result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (difficulty) {
      result = result.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return result;
  },

  findById: async (idOrSlug) => {
    let prob = null;

    if (isDBConnected()) {
      const queryOr = [{ id: idOrSlug }, { slug: idOrSlug }];
      if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
        queryOr.push({ _id: idOrSlug });
      }
      const found = await Problem.findOne({ $or: queryOr }).lean();
      if (found) {
        prob = { ...found, id: found.id || found._id.toString() };
      }
    } else {
      prob = inMemoryProblems.find(p => p.id === idOrSlug || p.slug === idOrSlug);
    }

    if (!prob) return null;

    const templates = (prob.starterTemplates && (prob.starterTemplates.c || prob.starterTemplates.cpp || prob.starterTemplates.java))
      ? prob.starterTemplates
      : starterTemplates[prob.id] || {
          c: `// Solution for ${prob.title} in C\n#include <stdio.h>\n#include <stdlib.h>\n\nvoid solve() {\n    // Write your code here\n}`,
          cpp: `// Solution for ${prob.title} in C++\n#include <iostream>\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your code here\n    }\n};`,
          java: `// Solution for ${prob.title} in Java\nclass Solution {\n    public void solve() {\n        // Write your code here\n    }\n}`
        };

    return {
      ...prob,
      starterTemplates: templates
    };
  },

  getSubmissions: async (problemId) => {
    if (isDBConnected()) {
      const subs = await Submission.find({ problemId }).sort({ createdAt: -1 }).lean();
      return subs.map(s => ({
        id: s.submissionId || s._id.toString(),
        timestamp: s.timestamp || s.createdAt,
        language: s.language,
        code: s.code,
        status: s.status,
        runtime: s.runtime,
        memory: s.memory,
        passCount: s.passCount
      }));
    }
    return inMemorySubmissions[problemId] || [];
  },

  addSubmission: async (problemId, submission) => {
    const subId = 'sub-' + Date.now();
    const timestamp = new Date().toISOString();

    if (isDBConnected()) {
      const newSub = await Submission.create({
        submissionId: subId,
        problemId,
        language: submission.language,
        code: submission.code,
        status: submission.status,
        runtime: submission.runtime,
        memory: submission.memory,
        passCount: submission.passCount,
        timestamp
      });
      return {
        id: newSub.submissionId,
        timestamp: newSub.timestamp,
        ...submission
      };
    }

    if (!inMemorySubmissions[problemId]) {
      inMemorySubmissions[problemId] = [];
    }
    const record = {
      id: subId,
      timestamp,
      ...submission
    };
    inMemorySubmissions[problemId].unshift(record);
    return record;
  }
};
