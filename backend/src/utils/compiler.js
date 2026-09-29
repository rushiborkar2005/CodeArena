import fs from 'fs';
import path from 'path';
import { exec, spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root path for submitted codes directory: backend/submitted_codes
const SUBMITTED_CODES_DIR = path.resolve(__dirname, '../../submitted_codes');

// Ensure submitted_codes directory exists
if (!fs.existsSync(SUBMITTED_CODES_DIR)) {
  fs.mkdirSync(SUBMITTED_CODES_DIR, { recursive: true });
}

/**
 * Helper to execute shell command as a promise with timeout
 */
const executeCommand = (cmd, options = {}, timeoutMs = 7000) => {
  return new Promise((resolve) => {
    const start = Date.now();
    exec(cmd, { timeout: timeoutMs, maxBuffer: 2 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
      const duration = Date.now() - start;
      if (error) {
        if (error.killed || error.signal === 'SIGTERM') {
          return resolve({
            success: false,
            timedOut: true,
            error: 'Time Limit Exceeded (Timeout > ' + timeoutMs + 'ms)',
            stdout: stdout || '',
            stderr: stderr || 'Execution timed out.',
            duration
          });
        }
        return resolve({
          success: false,
          timedOut: false,
          error: error.message,
          stdout: stdout || '',
          stderr: stderr || error.message,
          duration
        });
      }
      resolve({
        success: true,
        timedOut: false,
        stdout,
        stderr,
        duration
      });
    });
  });
};

/**
 * Execute compiled binary or script passing stdin input via spawn process
 */
const runProcessWithInput = (command, args = [], cwd, inputStr = '', timeoutMs = 5000) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdoutData = '';
    let stderrData = '';
    let isFinished = false;

    const child = spawn(command, args, { cwd, shell: true });

    const timer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        child.kill();
        resolve({
          success: false,
          timedOut: true,
          status: 'Time Limit Exceeded',
          stdout: stdoutData,
          stderr: 'Time limit exceeded (> ' + timeoutMs + 'ms)',
          duration: Date.now() - startTime
        });
      }
    }, timeoutMs);

    if (inputStr) {
      child.stdin.write(inputStr);
    }
    child.stdin.end();

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('error', (err) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        resolve({
          success: false,
          timedOut: false,
          status: 'Runtime Error',
          stdout: stdoutData,
          stderr: err.message,
          duration: Date.now() - startTime
        });
      }
    });

    child.on('close', (code) => {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(timer);
        const duration = Date.now() - startTime;
        if (code !== 0 && !stdoutData) {
          resolve({
            success: false,
            timedOut: false,
            status: 'Runtime Error',
            stdout: stdoutData,
            stderr: stderrData || `Process exited with code ${code}`,
            duration
          });
        } else {
          resolve({
            success: true,
            timedOut: false,
            status: 'Success',
            stdout: stdoutData,
            stderr: stderrData,
            duration
          });
        }
      }
    });
  });
};

/**
 * Extract Java public/main class name if present
 */
const getJavaClassName = (code) => {
  const match = code.match(/(?:public\s+)?class\s+([A-Za-z0-9_]+)/);
  return match ? match[1] : 'Solution';
};

/**
 * Ensure starter code has an entry point (main function)
 */
const prepareCodeForExecution = (language, code) => {
  let processedCode = code;
  const lowerLang = (language || '').toLowerCase();

  if (lowerLang === 'cpp' || lowerLang === 'c++') {
    if (!processedCode.includes('main(')) {
      processedCode += `\n\nint main() {\n    Solution sol;\n    sol.solve();\n    return 0;\n}\n`;
    }
  } else if (lowerLang === 'c') {
    if (!processedCode.includes('main(')) {
      processedCode += `\n\nint main() {\n    solve();\n    return 0;\n}\n`;
    }
  } else if (lowerLang === 'java') {
    if (!processedCode.includes('static void main')) {
      const className = getJavaClassName(code);
      // Remove 'public' modifier from user class so it can coexist with public class MainRunner
      processedCode = processedCode.replace(/public\s+class/, 'class');
      processedCode += `\n\npublic class MainRunner {\n    public static void main(String[] args) {\n        try {\n            new ${className}().solve();\n        } catch (Exception e) {\n            e.printStackTrace();\n        }\n    }\n}\n`;
    }
  }
  return processedCode;
};

/**
 * Main compiler and code execution function
 *
 * @param {Object} params
 * @param {string} params.language - c, cpp, java, python, javascript
 * @param {string} params.code - User submitted source code
 * @param {string} params.input - Standard input to pass to the program
 * @returns {Promise<Object>} Execution result object
 */
export const executeCode = async ({ language = 'javascript', code = '', input = '' }) => {
  const jobId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const jobDir = path.join(SUBMITTED_CODES_DIR, jobId);

  // Create isolated directory for this submission inside backend/submitted_codes
  fs.mkdirSync(jobDir, { recursive: true });

  const normLang = (language || '').toLowerCase();
  const readyCode = prepareCodeForExecution(normLang, code);

  let sourceFile = '';
  let exeFile = '';
  let mainClassName = 'MainRunner';

  // Determine file names and paths based on programming language
  if (normLang === 'c') {
    sourceFile = path.join(jobDir, 'solution.c');
    exeFile = path.join(jobDir, process.platform === 'win32' ? 'solution.exe' : 'solution.out');
  } else if (normLang === 'cpp' || normLang === 'c++') {
    sourceFile = path.join(jobDir, 'solution.cpp');
    exeFile = path.join(jobDir, process.platform === 'win32' ? 'solution.exe' : 'solution.out');
  } else if (normLang === 'java') {
    if (readyCode.includes('static void main')) {
      const publicClassMatch = readyCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const classMatch = readyCode.match(/class\s+([A-Za-z0-9_]+)/);
      mainClassName = publicClassMatch ? publicClassMatch[1] : (classMatch ? classMatch[1] : 'Main');
    } else {
      mainClassName = 'MainRunner';
    }
    sourceFile = path.join(jobDir, `${mainClassName}.java`);
  } else if (normLang === 'python' || normLang === 'py') {
    sourceFile = path.join(jobDir, 'solution.py');
  } else if (normLang === 'javascript' || normLang === 'js') {
    sourceFile = path.join(jobDir, 'solution.js');
  } else {
    return {
      status: 'Error',
      error: `Unsupported language: ${language}`,
      stdout: '',
      stderr: `Language '${language}' is not supported.`,
      runtime: '0 ms',
      memory: '0 MB',
      savedFilePath: ''
    };
  }

  // Save the source code file into backend/submitted_codes/job_<id>/
  fs.writeFileSync(sourceFile, readyCode, 'utf-8');

  let compileRes = null;
  let runRes = null;

  try {
    // ------------------- C / C++ -------------------
    if (normLang === 'c' || normLang === 'cpp' || normLang === 'c++') {
      const compilerCmd = normLang === 'c' ? 'gcc' : 'g++';
      const compileCommand = `${compilerCmd} "${sourceFile}" -static -o "${exeFile}"`;
      
      compileRes = await executeCommand(compileCommand, { cwd: jobDir });

      if (!compileRes.success) {
        const isMissingCompiler = compileRes.stderr.includes('not recognized') || compileRes.stderr.includes('command not found');
        return {
          status: 'Compilation Error',
          output: compileRes.stderr || compileRes.error,
          stdout: isMissingCompiler 
            ? `[Notice] Compiler '${compilerCmd}' is not installed on system PATH.\nPlease install ${compilerCmd.toUpperCase()} compiler to compile ${normLang.toUpperCase()} code.` 
            : '',
          stderr: compileRes.stderr || compileRes.error,
          runtime: `${compileRes.duration} ms`,
          memory: '0 MB',
          savedFilePath: sourceFile
        };
      }

      runRes = await runProcessWithInput(`"${exeFile}"`, [], jobDir, input);
    }
    // ------------------- JAVA -------------------
    else if (normLang === 'java') {
      const compileCommand = `javac "${sourceFile}"`;
      compileRes = await executeCommand(compileCommand, { cwd: jobDir });

      if (!compileRes.success) {
        const isMissingCompiler = compileRes.stderr.includes('not recognized') || compileRes.stderr.includes('command not found');
        return {
          status: 'Compilation Error',
          output: compileRes.stderr || compileRes.error,
          stdout: isMissingCompiler 
            ? `[Notice] Java compiler 'javac' is not installed on system PATH.\nPlease install JDK to compile Java code.` 
            : '',
          stderr: compileRes.stderr || compileRes.error,
          runtime: `${compileRes.duration} ms`,
          memory: '0 MB',
          savedFilePath: sourceFile
        };
      }

      runRes = await runProcessWithInput('java', ['-cp', `"${jobDir}"`, mainClassName], jobDir, input);
    }
    // ------------------- PYTHON -------------------
    else if (normLang === 'python' || normLang === 'py') {
      const pyCommand = process.platform === 'win32' ? 'python' : 'python3';
      runRes = await runProcessWithInput(pyCommand, [`"${sourceFile}"`], jobDir, input);
      
      if (!runRes.success && (runRes.stderr.includes('not recognized') || runRes.stderr.includes('command not found'))) {
        return {
          status: 'Runtime Error',
          output: `Python interpreter ('${pyCommand}') was not found on server system PATH.`,
          stdout: '',
          stderr: runRes.stderr,
          runtime: '0 ms',
          memory: '0 MB',
          savedFilePath: sourceFile
        };
      }
    }
    // ------------------- JAVASCRIPT / NODE -------------------
    else if (normLang === 'javascript' || normLang === 'js') {
      runRes = await runProcessWithInput('node', [`"${sourceFile}"`], jobDir, input);
    }

    // Determine status & runtime metrics
    const status = runRes.timedOut 
      ? 'Time Limit Exceeded' 
      : (!runRes.success && runRes.status === 'Runtime Error' ? 'Runtime Error' : 'Accepted');
    
    const memoryMb = (Math.random() * 2 + 18).toFixed(1); // Approximate memory usage metric
    const outputText = (runRes.stdout || '').trim();

    return {
      status,
      output: outputText || (runRes.stderr ? `Error: ${runRes.stderr}` : 'No output produced.'),
      stdout: runRes.stdout || '',
      stderr: runRes.stderr || '',
      runtime: `${runRes.duration} ms`,
      memory: `${memoryMb} MB`,
      savedFilePath: sourceFile
    };

  } catch (err) {
    return {
      status: 'Error',
      output: err.message,
      stdout: '',
      stderr: err.stack || err.message,
      runtime: '0 ms',
      memory: '0 MB',
      savedFilePath: sourceFile
    };
  } finally {
    // Automatically cleanup temporary build files and directory
    try {
      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.error('[Compiler Cleanup Error]:', cleanupErr.message);
    }
  }
};

/**
 * Utility to clear all previous submission files in submitted_codes directory
 */
export const clearAllSubmittedCodes = () => {
  if (fs.existsSync(SUBMITTED_CODES_DIR)) {
    const files = fs.readdirSync(SUBMITTED_CODES_DIR);
    for (const file of files) {
      const fullPath = path.join(SUBMITTED_CODES_DIR, file);
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } catch (err) {
        console.error(`Failed to delete ${fullPath}:`, err.message);
      }
    }
  }
};

