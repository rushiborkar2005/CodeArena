import axios from 'axios';

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
      if (processedCode.includes('twoSum')) {
        processedCode += `\n\n#include <iostream>\n#include <vector>\nint main() {\n    Solution sol;\n    std::vector<int> nums = {2, 7, 11, 15};\n    auto res = sol.twoSum(nums, 9);\n    std::cout << "[" << (res.size() > 0 ? res[0] : 0) << "," << (res.size() > 1 ? res[1] : 0) << "]";\n    return 0;\n}\n`;
      } else if (processedCode.includes('isValid')) {
        processedCode += `\n\n#include <iostream>\nint main() {\n    Solution sol;\n    std::cout << (sol.isValid("()[]{}") ? "true" : "false");\n    return 0;\n}\n`;
      } else if (processedCode.includes('lengthOfLongestSubstring')) {
        processedCode += `\n\n#include <iostream>\nint main() {\n    Solution sol;\n    std::cout << sol.lengthOfLongestSubstring("abcabcbb");\n    return 0;\n}\n`;
      } else if (processedCode.includes('maxArea')) {
        processedCode += `\n\n#include <iostream>\n#include <vector>\nint main() {\n    Solution sol;\n    std::vector<int> h = {1,8,6,2,5,4,8,3,7};\n    std::cout << sol.maxArea(h);\n    return 0;\n}\n`;
      } else {
        processedCode += `\n\nint main() {\n    Solution sol;\n    // fallback\n    return 0;\n}\n`;
      }
    }
  } else if (lowerLang === 'c') {
    if (!processedCode.includes('main(')) {
      if (processedCode.includes('twoSum')) {
        processedCode += `\n\nint main() {\n    int nums[] = {2, 7, 11, 15};\n    int retSize = 0;\n    int* res = twoSum(nums, 4, 9, &retSize);\n    if (res && retSize >= 2) printf("[%d,%d]", res[0], res[1]);\n    else printf("[]");\n    return 0;\n}\n`;
      } else if (processedCode.includes('isValid')) {
        processedCode += `\n\nint main() {\n    printf("%s", isValid("()[]{}") ? "true" : "false");\n    return 0;\n}\n`;
      } else if (processedCode.includes('lengthOfLongestSubstring')) {
        processedCode += `\n\nint main() {\n    printf("%d", lengthOfLongestSubstring("abcabcbb"));\n    return 0;\n}\n`;
      } else if (processedCode.includes('maxArea')) {
        processedCode += `\n\nint main() {\n    int h[] = {1,8,6,2,5,4,8,3,7};\n    printf("%d", maxArea(h, 9));\n    return 0;\n}\n`;
      } else {
        processedCode += `\n\nint main() {\n    return 0;\n}\n`;
      }
    }
  } else if (lowerLang === 'java') {
    if (!processedCode.includes('static void main')) {
      const className = getJavaClassName(code);
      processedCode = processedCode.replace(/public\s+class/, 'class');
      if (processedCode.includes('twoSum')) {
        processedCode += `\n\npublic class MainRunner {\n    public static void main(String[] args) {\n        int[] res = new ${className}().twoSum(new int[]{2,7,11,15}, 9);\n        System.out.print("[" + (res.length > 0 ? res[0] : 0) + "," + (res.length > 1 ? res[1] : 0) + "]");\n    }\n}\n`;
      } else if (processedCode.includes('isValid')) {
        processedCode += `\n\npublic class MainRunner {\n    public static void main(String[] args) {\n        System.out.print(new ${className}().isValid("()[]{}"));\n    }\n}\n`;
      } else if (processedCode.includes('lengthOfLongestSubstring')) {
        processedCode += `\n\npublic class MainRunner {\n    public static void main(String[] args) {\n        System.out.print(new ${className}().lengthOfLongestSubstring("abcabcbb"));\n    }\n}\n`;
      } else if (processedCode.includes('maxArea')) {
        processedCode += `\n\npublic class MainRunner {\n    public static void main(String[] args) {\n        System.out.print(new ${className}().maxArea(new int[]{1,8,6,2,5,4,8,3,7}));\n    }\n}\n`;
      } else {
        processedCode += `\n\npublic class MainRunner {\n    public static void main(String[] args) {\n    }\n}\n`;
      }
    }
  }
  return processedCode;
};

/**
 * Execute compiled binary or script passing stdin input using JDoodle API
 */
export const executeCode = async ({ language = 'javascript', code = '', input = '' }) => {
  const normLang = (language || '').toLowerCase();
  const readyCode = prepareCodeForExecution(normLang, code);

  let jdoodleLang = 'nodejs';
  let versionIndex = '0';
  
  if (normLang === 'c') {
    jdoodleLang = 'c';
    versionIndex = '5'; // GCC 9.1.0
  } else if (normLang === 'cpp' || normLang === 'c++') {
    jdoodleLang = 'cpp';
    versionIndex = '5'; // GCC 9.1.0
  } else if (normLang === 'java') {
    jdoodleLang = 'java';
    versionIndex = '4'; // JDK 17.0.1
  } else if (normLang === 'python' || normLang === 'py') {
    jdoodleLang = 'python3';
    versionIndex = '3'; // Python 3.9.9
  } else if (normLang === 'javascript' || normLang === 'js') {
    jdoodleLang = 'nodejs';
    versionIndex = '4'; // Node 17.1.0
  } else {
    return {
      status: 'Error',
      error: `Unsupported language: ${language}`,
      stdout: '',
      stderr: `Language '${language}' is not supported.`,
      runtime: '0 ms',
      memory: '0 MB'
    };
  }

  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      status: 'Error',
      output: 'JDoodle API credentials are missing in the server environment. Please set JDOODLE_CLIENT_ID and JDOODLE_CLIENT_SECRET in your backend .env file.',
      stdout: '',
      stderr: 'Missing JDoodle API keys.',
      runtime: '0 ms',
      memory: '0 MB',
      savedFilePath: ''
    };
  }

  try {
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId,
      clientSecret,
      script: readyCode,
      language: jdoodleLang,
      versionIndex,
      stdin: input
    });

    const data = response.data;

    let outputText = data.output || '';
    let status = 'Accepted';
    let stdout = '';
    let stderr = '';
    
    // Determine JDoodle Error status
    if (data.statusCode !== 200) {
        status = 'Error';
        stderr = outputText;
    } else {
        if (outputText.includes('Exception in thread') || outputText.includes('Traceback (most recent call last):')) {
            status = 'Runtime Error';
            stderr = outputText;
        } else if (outputText.includes('error:') && (jdoodleLang === 'c' || jdoodleLang === 'cpp')) {
            status = 'Compilation Error';
            stderr = outputText;
        } else if (data.memory === null && data.cpuTime === null) {
            status = 'Compilation Error';
            stderr = outputText;
        } else {
            stdout = outputText;
        }
    }

    return {
      status,
      output: outputText.trim() || 'No output produced.',
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      runtime: data.cpuTime ? `${Math.round(parseFloat(data.cpuTime) * 1000)} ms` : '0 ms',
      memory: data.memory ? `${(data.memory / 1024).toFixed(1)} MB` : '0 MB',
      savedFilePath: ''
    };

  } catch (err) {
    const errorMsg = err.response?.data?.error || err.message;
    return {
      status: 'Error',
      output: `API Request Failed: ${errorMsg}`,
      stdout: '',
      stderr: `API Request Failed: ${errorMsg}`,
      runtime: '0 ms',
      memory: '0 MB',
      savedFilePath: ''
    };
  }
};

/**
 * Utility to clear all previous submission files. No longer needed since JDoodle is used, but kept for interface compatibility.
 */
export const clearAllSubmittedCodes = () => {
  // Deprecated: No longer managing local files
};
