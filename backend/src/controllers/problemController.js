import { problemModel } from '../models/problemModel.js';
import { executeCode } from '../utils/compiler.js';

/**
 * @desc   Get all Online Judge problems
 * @route  GET /api/problems
 * @access Public
 */
export const getProblems = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;
    const problems = await problemModel.findAll({ category, difficulty, search });
    res.status(200).json({
      count: problems.length,
      problems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single problem details
 * @route  GET /api/problems/:id
 * @access Public
 */
export const getProblemById = async (req, res, next) => {
  try {
    const problem = await problemModel.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    const submissions = await problemModel.getSubmissions(problem.id);
    res.status(200).json({
      ...problem,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Run code against custom or sample test cases
 * @route  POST /api/problems/:id/run
 * @access Public
 */
export const runProblemCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'javascript', code, testInput } = req.body;
    const problem = await problemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Code solution cannot be empty' });
    }

    const inputToUse = testInput !== undefined ? testInput : problem.sampleInput;
    const expectedOutput = problem.sampleOutput || '';

    // Execute code using backend compiler engine
    const execResult = await executeCode({
      language,
      code,
      input: inputToUse
    });

    let status = execResult.status;

    // Compare output if program ran successfully
    if (status === 'Accepted') {
      const actualOut = (execResult.output || '').trim();
      const expOut = (expectedOutput || '').trim();
      
      // If expected output is known and doesn't match
      if (expOut && actualOut !== expOut) {
        status = 'Wrong Answer';
      }
    }

    res.status(200).json({
      status,
      runtime: execResult.runtime,
      memory: execResult.memory,
      input: inputToUse,
      output: execResult.output,
      expectedOutput: expectedOutput,
      stdout: execResult.stdout || execResult.stderr || '',
      savedFilePath: execResult.savedFilePath,
      testcasesPassed: status === 'Accepted' ? '1 / 1' : '0 / 1'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Submit code for evaluation against test suite
 * @route  POST /api/problems/:id/submit
 * @access Public
 */
export const submitProblemCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { language = 'javascript', code } = req.body;
    const problem = await problemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({ message: 'Code solution cannot be empty' });
    }

    const testCases = problem.testCases && problem.testCases.length > 0
      ? problem.testCases
      : [{ input: problem.sampleInput, expectedOutput: problem.sampleOutput }];

    let passedCount = 0;
    let finalStatus = 'Accepted';
    let lastExecResult = null;
    let failedCaseDetails = null;

    // Run code against each test case
    for (const tc of testCases) {
      const execResult = await executeCode({
        language,
        code,
        input: tc.input || ''
      });

      lastExecResult = execResult;

      if (execResult.status === 'Compilation Error') {
        finalStatus = 'Compilation Error';
        failedCaseDetails = {
          input: tc.input,
          output: execResult.output,
          expectedOutput: tc.expectedOutput,
          stdout: execResult.stdout || execResult.stderr
        };
        break;
      }
      if (execResult.status === 'Runtime Error') {
        finalStatus = 'Runtime Error';
        failedCaseDetails = {
          input: tc.input,
          output: execResult.output,
          expectedOutput: tc.expectedOutput,
          stdout: execResult.stdout || execResult.stderr
        };
        break;
      }
      if (execResult.status === 'Time Limit Exceeded') {
        finalStatus = 'Time Limit Exceeded';
        failedCaseDetails = {
          input: tc.input,
          output: execResult.output,
          expectedOutput: tc.expectedOutput,
          stdout: execResult.stdout || execResult.stderr
        };
        break;
      }

      const actualOut = (execResult.output || '').trim();
      const expectedOut = (tc.expectedOutput || '').trim();

      if (expectedOut && actualOut === expectedOut) {
        passedCount++;
      } else if (!expectedOut && execResult.status === 'Accepted') {
        passedCount++;
      } else {
        if (finalStatus === 'Accepted') {
          finalStatus = 'Wrong Answer';
          if (!failedCaseDetails) {
            failedCaseDetails = {
              input: tc.input,
              output: execResult.output,
              expectedOutput: tc.expectedOutput,
              stdout: execResult.stdout || execResult.stderr
            };
          }
        }
      }
    }

    const totalCases = testCases.length;
    const runtime = lastExecResult ? lastExecResult.runtime : '0 ms';
    const memory = lastExecResult ? lastExecResult.memory : '0 MB';

    const submissionRecord = await problemModel.addSubmission(problem.id, {
      language,
      code,
      status: finalStatus,
      runtime,
      memory,
      passCount: `${passedCount}/${totalCases}`
    });

    const firstTC = testCases[0] || {};

    res.status(200).json({
      submissionId: submissionRecord.id,
      status: submissionRecord.status,
      runtime: submissionRecord.runtime,
      memory: submissionRecord.memory,
      testcasesPassed: `${passedCount} / ${totalCases}`,
      totalCases: totalCases,
      timestamp: submissionRecord.timestamp,
      input: failedCaseDetails ? failedCaseDetails.input : firstTC.input,
      output: failedCaseDetails ? failedCaseDetails.output : (lastExecResult ? lastExecResult.output : ''),
      expectedOutput: failedCaseDetails ? failedCaseDetails.expectedOutput : firstTC.expectedOutput,
      stdout: failedCaseDetails ? failedCaseDetails.stdout : (lastExecResult ? lastExecResult.stdout : ''),
      message: finalStatus === 'Accepted'
        ? 'All test cases passed successfully!'
        : `Evaluation finished with status: ${finalStatus} (${passedCount}/${totalCases} passed)`
    });
  } catch (error) {
    next(error);
  }
};

import { callLLM } from '../services/aiService.js';

/**
 * @desc   Get AI hint for a problem
 * @route  POST /api/problems/:id/hint
 * @access Public
 */
export const getProblemHint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, language = 'javascript' } = req.body;
    const problem = await problemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert programming mentor. Your job is to give a helpful but subtle hint to a student working on a coding problem. Do NOT give them the direct answer or the full code. Give them a conceptual nudge.'
      },
      {
        role: 'user',
        content: `Problem: ${problem.title}\nDescription: ${problem.description}\nLanguage: ${language}\n\nStudent's current code:\n\`\`\`\n${code || '(Empty)'}\n\`\`\`\n\nPlease give a short, constructive hint.`
      }
    ];

    const hint = await callLLM(messages);
    res.status(200).json({ hint });
  } catch (error) {
    console.error('Hint error:', error.message);
    res.status(500).json({ message: 'Failed to generate hint.', error: error.message });
  }
};

/**
 * @desc   Get AI code review/optimization
 * @route  POST /api/problems/:id/review
 * @access Public
 */
export const reviewProblemCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, language = 'javascript', status, runtime, memory } = req.body;
    const problem = await problemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert senior software engineer. Review the submitted code. If it failed, explain why gently. If it passed, suggest time/space complexity improvements, better variable naming, or more idiomatic constructs.'
      },
      {
        role: 'user',
        content: `Problem: ${problem.title}\nDescription: ${problem.description}\nLanguage: ${language}\nStatus: ${status}\nRuntime: ${runtime}\nMemory: ${memory}\n\nSubmitted code:\n\`\`\`\n${code}\n\`\`\`\n\nPlease review this code.`
      }
    ];

    const review = await callLLM(messages);
    res.status(200).json({ review });
  } catch (error) {
    console.error('Review error:', error.message);
    res.status(500).json({ message: 'Failed to generate review.', error: error.message });
  }
};
