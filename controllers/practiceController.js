const PracticeQuestion = require("../models/PracticeQuestion");
const UserPracticeProgress = require("../models/UserPracticeProgress");
const axios = require("axios");

/**
 * Practice Controller
 * Handles practice questions and code execution for C/C++
 */

// Helper: Format category name for display
const formatCategoryName = (category) => {
  const categoryNames = {
    "classes-objects": "Classes & Objects",
    inheritance: "Inheritance",
    polymorphism: "Polymorphism",
    encapsulation: "Encapsulation",
    abstraction: "Abstraction",
    "constructors-destructors": "Constructors & Destructors",
    "operator-overloading": "Operator Overloading",
    templates: "Templates",
    "exception-handling": "Exception Handling",
    "file-handling": "File Handling",
    stl: "Standard Template Library (STL)",
    pointers: "Pointers & Memory",
    "basic-syntax": "Basic Syntax",
    "arrays-strings": "Arrays & Strings",
    functions: "Functions",
    other: "Other",
  };
  return categoryNames[category] || category;
};

/**
 * Get all practice questions with optional filters
 * GET /api/practice/questions
 */
exports.getAllQuestions = async (req, res) => {
  try {
    const { category, difficulty, language, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (language) filter.language = language;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      PracticeQuestion.find(filter)
        .select("-solutionCode -testCases.expectedOutput")
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PracticeQuestion.countDocuments(filter),
    ]);

    // If user is logged in, get their progress
    let progressMap = {};
    if (req.user) {
      const progress = await UserPracticeProgress.find({
        user: req.user._id,
        question: { $in: questions.map((q) => q._id) },
      }).select("question status totalAttempts");

      progress.forEach((p) => {
        progressMap[p.question.toString()] = {
          status: p.status,
          attempts: p.totalAttempts,
        };
      });
    }

    const questionsWithProgress = questions.map((q) => ({
      ...q.toObject(),
      userProgress: progressMap[q._id.toString()] || {
        status: "not-started",
        attempts: 0,
      },
    }));

    res.json({
      success: true,
      questions: questionsWithProgress,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching practice questions:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch questions" });
  }
};

/**
 * Get a single practice question by ID
 * GET /api/practice/questions/:id
 */
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    const question =
      await PracticeQuestion.findById(id).select("-solutionCode"); // Don't send solution

    if (!question || !question.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Filter out hidden test case expected outputs
    const filteredTestCases = question.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.isHidden ? "[Hidden]" : tc.expectedOutput,
      description: tc.description,
      isHidden: tc.isHidden,
    }));

    // Get user progress if logged in
    let userProgress = null;
    if (req.user) {
      userProgress = await UserPracticeProgress.findOne({
        user: req.user._id,
        question: id,
      });
    }

    // Increment view count (optional tracking)

    res.json({
      success: true,
      question: {
        ...question.toObject(),
        testCases: filteredTestCases,
      },
      userProgress: userProgress
        ? {
            status: userProgress.status,
            lastSubmittedCode: userProgress.lastSubmittedCode,
            totalAttempts: userProgress.totalAttempts,
            hintsUsed: userProgress.hintsUsed,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching question:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch question" });
  }
};

/**
 * Get categories with question counts
 * GET /api/practice/categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await PracticeQuestion.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          easyCount: {
            $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] },
          },
          mediumCount: {
            $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] },
          },
          hardCount: {
            $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const formattedCategories = categories.map((c) => ({
      id: c._id,
      name: formatCategoryName(c._id),
      count: c.count,
      difficulty: {
        easy: c.easyCount,
        medium: c.mediumCount,
        hard: c.hardCount,
      },
    }));

    res.json({
      success: true,
      categories: formattedCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
};

/**
 * Execute C/C++ code using multiple fallback APIs
 * POST /api/practice/execute
 */
exports.executeCode = async (req, res) => {
  try {
    const { code, language, input = "" } = req.body;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Code is required" });
    }

    if (!language || !["c", "cpp"].includes(language)) {
      return res.status(400).json({
        success: false,
        message: "Invalid language. Use 'c' or 'cpp'",
      });
    }

    // Detect if code requires input (cin, scanf, getline, etc.)
    const inputPatterns = [
      /\bcin\s*>>/, // cin >>
      /\bscanf\s*\(/, // scanf(
      /\bgetline\s*\(/, // getline(
      /\bgets\s*\(/, // gets(
      /\bgetchar\s*\(/, // getchar(
      /\bfgets\s*\(/, // fgets(
      /\bgetc\s*\(/, // getc(
      /\bfscanf\s*\(\s*stdin/, // fscanf(stdin
    ];

    const requiresInput = inputPatterns.some((pattern) => pattern.test(code));
    const inputIsEmpty = !input || input.trim() === "";

    // If code requires input but none provided, return a helpful warning
    if (requiresInput && inputIsEmpty) {
      return res.json({
        success: true,
        status: "input_required",
        message:
          "⚠️ Your code requires input! Please enter values in the stdin box before running.",
        output: "",
        stderr:
          "INPUT REQUIRED: Your program uses cin/scanf to read input.\n\nOnline compilers work differently from your local terminal:\n• You must provide ALL input BEFORE running the code\n• Enter your input values in the 'stdin' box on the left\n• For multiple values, enter them separated by spaces or newlines\n\nExample: If your program needs two numbers, enter:\n5 10\nor:\n5\n10",
        compileOutput: "",
        executionTime: null,
        memoryUsed: null,
      });
    }

    // Try multiple APIs in order of preference
    let result = null;
    let lastError = null;

    // Try 1: Judge0 API (best for stdin handling)
    const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
    if (JUDGE0_API_KEY) {
      try {
        result = await executeWithJudge0(code, language, input);
        if (result) {
          return res.json(result);
        }
      } catch (err) {
        console.error("Judge0 API error:", err.message);
        lastError = err;
      }
    }

    // Try 2: Wandbox API (Japanese free compiler, very reliable)
    try {
      result = await executeWithWandbox(code, language, input);
      if (result) {
        return res.json(result);
      }
    } catch (err) {
      console.error("Wandbox API error:", err.message);
      lastError = err;
    }

    // Try 3: Rextester API
    try {
      result = await executeWithRextester(code, language, input);
      if (result) {
        return res.json(result);
      }
    } catch (err) {
      console.error("Rextester API error:", err.message);
      lastError = err;
    }

    // Try 4: JDoodle if configured
    const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
    const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;
    if (JDOODLE_CLIENT_ID && JDOODLE_CLIENT_SECRET) {
      return executeWithJDoodle(code, language, input, res);
    }

    // If all APIs fail, return error
    res.status(500).json({
      success: false,
      status: "error",
      message:
        "Code execution service is temporarily unavailable. Please try again later.",
      output: "",
      stderr: lastError?.message || "All execution services failed",
    });
  } catch (error) {
    console.error("Error executing code:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Failed to execute code. Please try again.",
      output: "",
      stderr: error.message,
    });
  }
};

/**
 * Execute using Judge0 API (RapidAPI - best stdin handling)
 * Uses polling to get results
 */
async function executeWithJudge0(code, language, input) {
  const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
  const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

  // Language IDs for Judge0:
  // C (GCC 9.2.0) = 50, C++ (GCC 9.2.0) = 54
  // C (GCC 10.2.0) = 75, C++ (GCC 10.2.0) = 76
  const languageId = language === "cpp" ? 54 : 50;

  // Encode code and input in base64
  const base64Code = Buffer.from(code).toString("base64");
  const base64Input = input ? Buffer.from(input).toString("base64") : "";

  // Submit the code for execution
  const submitResponse = await axios.post(
    `https://${JUDGE0_HOST}/submissions?base64_encoded=true&wait=false`,
    {
      source_code: base64Code,
      language_id: languageId,
      stdin: base64Input,
      cpu_time_limit: 5,
      memory_limit: 128000,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": JUDGE0_API_KEY,
        "X-RapidAPI-Host": JUDGE0_HOST,
      },
      timeout: 10000,
    }
  );

  const token = submitResponse.data.token;

  if (!token) {
    throw new Error("Failed to get submission token from Judge0");
  }

  // Poll for results (max 30 seconds)
  let result = null;
  const maxAttempts = 15;
  const pollInterval = 2000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollInterval));

    const resultResponse = await axios.get(
      `https://${JUDGE0_HOST}/submissions/${token}?base64_encoded=true`,
      {
        headers: {
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": JUDGE0_HOST,
        },
        timeout: 10000,
      }
    );

    result = resultResponse.data;

    // Status IDs: 1 = In Queue, 2 = Processing, 3+ = Done
    if (result.status && result.status.id > 2) {
      break;
    }
  }

  if (!result || (result.status && result.status.id <= 2)) {
    throw new Error("Execution timed out");
  }

  // Decode base64 outputs
  const decodeBase64 = (str) => {
    if (!str) return "";
    try {
      return Buffer.from(str, "base64").toString("utf-8");
    } catch {
      return str;
    }
  };

  const stdout = decodeBase64(result.stdout);
  const stderr = decodeBase64(result.stderr);
  const compileOutput = decodeBase64(result.compile_output);

  // Determine status based on Judge0 status ID
  // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded,
  // 6 = Compilation Error, 7-12 = Runtime Errors, 13 = Internal Error, 14 = Exec Format Error
  let status = "success";
  let message = "Code executed successfully";

  const statusId = result.status?.id;

  if (statusId === 6) {
    status = "compile_error";
    message = "Compilation failed";
  } else if (statusId === 5) {
    status = "runtime_error";
    message = "Time limit exceeded";
  } else if (statusId >= 7 && statusId <= 12) {
    status = "runtime_error";
    message = result.status?.description || "Runtime error occurred";
  } else if (statusId === 13 || statusId === 14) {
    status = "error";
    message = result.status?.description || "Execution error";
  } else if (statusId !== 3 && stderr) {
    status = "runtime_error";
    message = "Runtime error occurred";
  }

  return {
    success: true,
    status,
    message,
    output: stdout.trim(),
    stderr: stderr.trim(),
    compileOutput: compileOutput.trim(),
    executionTime: result.time ? parseFloat(result.time) * 1000 : null,
    memoryUsed: result.memory ? Math.round(result.memory / 1024) : null, // Convert to KB
  };
}

/**
 * Execute using Wandbox API (free, no API key)
 */
async function executeWithWandbox(code, language, input) {
  const WANDBOX_API = "https://wandbox.org/api/compile.json";

  // Compiler selections for Wandbox
  const compiler = language === "cpp" ? "gcc-head" : "gcc-head-c";

  // Ensure input has a trailing newline if it doesn't (required for cin to work properly)
  const formattedInput = input
    ? input.endsWith("\n")
      ? input
      : input + "\n"
    : "";

  const response = await axios.post(
    WANDBOX_API,
    {
      code: code,
      compiler: compiler,
      stdin: formattedInput,
      options: language === "cpp" ? "c++17" : "",
      "compiler-option-raw": "-O2",
      "runtime-option-raw": "",
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  const result = response.data;

  let status = "success";
  let message = "Code executed successfully";

  if (result.status !== "0" && result.status !== 0) {
    if (result.compiler_error || result.compiler_message) {
      status = "compile_error";
      message = "Compilation failed";
    } else if (result.signal) {
      status = "runtime_error";
      message = "Runtime error occurred";
    } else {
      status = "error";
      message = "Execution failed";
    }
  }

  return {
    success: true,
    status,
    message,
    output: (result.program_output || "").trim(),
    stderr: (result.program_error || "").trim(),
    compileOutput: (
      result.compiler_error ||
      result.compiler_message ||
      ""
    ).trim(),
    executionTime: null,
    memoryUsed: null,
  };
}

/**
 * Execute using Rextester API (free, no API key)
 */
async function executeWithRextester(code, language, input) {
  const REXTESTER_API = "https://rextester.com/rundotnet/api";

  // Language codes: C++ = 7, C = 6
  const languageChoice = language === "cpp" ? 7 : 6;

  // Ensure input has a trailing newline if it doesn't (required for cin to work properly)
  const formattedInput = input
    ? input.endsWith("\n")
      ? input
      : input + "\n"
    : "";

  const params = new URLSearchParams();
  params.append("LanguageChoice", languageChoice);
  params.append("Program", code);
  params.append("Input", formattedInput);

  const response = await axios.post(REXTESTER_API, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    timeout: 30000,
  });

  const result = response.data;

  let status = "success";
  let message = "Code executed successfully";

  if (result.Errors) {
    if (result.Errors.includes("compilation")) {
      status = "compile_error";
      message = "Compilation failed";
    } else {
      status = "runtime_error";
      message = "Runtime error occurred";
    }
  }

  return {
    success: true,
    status,
    message,
    output: (result.Result || "").trim(),
    stderr: (result.Errors || "").trim(),
    compileOutput: (result.Warnings || "").trim(),
    executionTime: result.Stats ? parseFloat(result.Stats) : null,
    memoryUsed: null,
  };
}

/**
 * Fallback execution using JDoodle API
 */
async function executeWithJDoodle(code, language, input, res) {
  try {
    const JDOODLE_CLIENT_ID = process.env.JDOODLE_CLIENT_ID;
    const JDOODLE_CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET;

    // Ensure input has a trailing newline if it doesn't (required for cin to work properly)
    const formattedInput = input
      ? input.endsWith("\n")
        ? input
        : input + "\n"
      : "";

    if (!JDOODLE_CLIENT_ID || !JDOODLE_CLIENT_SECRET) {
      // Return simulated response for development
      return res.json({
        success: true,
        status: "simulated",
        message:
          "Code compilation API not configured. This is a simulated response.",
        output:
          "// Output will appear here when the compiler API is configured\n// Your code looks syntactically correct!",
        stderr: "",
        compileOutput: "",
        executionTime: 0,
        memoryUsed: 0,
      });
    }

    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: JDOODLE_CLIENT_ID,
      clientSecret: JDOODLE_CLIENT_SECRET,
      script: code,
      stdin: formattedInput,
      language: language === "cpp" ? "cpp17" : "c",
      versionIndex: "0",
    });

    const result = response.data;

    let status = "success";
    let message = "Code executed successfully";

    if (result.error) {
      status = "error";
      message = result.error;
    }

    res.json({
      success: true,
      status,
      message,
      output: result.output || "",
      stderr: result.error || "",
      compileOutput: "",
      executionTime: result.cpuTime ? parseFloat(result.cpuTime) * 1000 : null,
      memoryUsed: result.memory,
    });
  } catch (error) {
    console.error("JDoodle API error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Failed to execute code",
      output: "",
      stderr: error.message,
    });
  }
}

/**
 * Submit code solution for a question
 * POST /api/practice/questions/:id/submit
 */
exports.submitSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Code is required" });
    }

    // Get the question with solution and test cases
    const question = await PracticeQuestion.findById(id);

    if (!question || !question.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Run code against test cases
    const results = [];
    let allPassed = true;

    for (const testCase of question.testCases) {
      try {
        // Execute code with this test case input
        const execResult = await executeCodeInternal(
          code,
          question.language,
          testCase.input
        );

        const passed =
          execResult.output.trim() === testCase.expectedOutput.trim();

        if (!passed) allPassed = false;

        results.push({
          input: testCase.isHidden ? "[Hidden]" : testCase.input,
          expectedOutput: testCase.isHidden
            ? "[Hidden]"
            : testCase.expectedOutput,
          actualOutput:
            testCase.isHidden && !passed
              ? "[Incorrect]"
              : execResult.output.trim(),
          passed,
          isHidden: testCase.isHidden,
          description: testCase.description,
        });

        // If compilation error, stop
        if (execResult.status === "compile_error") {
          allPassed = false;
          break;
        }
      } catch (error) {
        allPassed = false;
        results.push({
          input: testCase.isHidden ? "[Hidden]" : testCase.input,
          expectedOutput: testCase.isHidden
            ? "[Hidden]"
            : testCase.expectedOutput,
          actualOutput: "Execution error",
          passed: false,
          isHidden: testCase.isHidden,
          error: error.message,
        });
      }
    }

    // Update user progress
    let progress = await UserPracticeProgress.findOne({
      user: userId,
      question: id,
    });

    if (!progress) {
      progress = new UserPracticeProgress({
        user: userId,
        question: id,
      });
    }

    progress.lastSubmittedCode = code;
    progress.totalAttempts += 1;
    progress.attempts.push({
      code,
      output: results.map((r) => r.actualOutput).join("\n"),
      isCorrect: allPassed,
      executionTime: 0,
    });

    if (allPassed && progress.status !== "solved") {
      progress.status = "solved";
      progress.firstSolvedAt = new Date();

      // Update question statistics
      await PracticeQuestion.findByIdAndUpdate(id, {
        $inc: { totalAttempts: 1, successfulAttempts: 1 },
      });
    } else {
      if (progress.status === "not-started") {
        progress.status = "attempted";
      }

      // Update question attempt count
      await PracticeQuestion.findByIdAndUpdate(id, {
        $inc: { totalAttempts: 1 },
      });
    }

    await progress.save();

    res.json({
      success: true,
      allPassed,
      results,
      message: allPassed
        ? "All test cases passed! 🎉"
        : "Some test cases failed. Keep trying!",
      progress: {
        status: progress.status,
        totalAttempts: progress.totalAttempts,
      },
    });
  } catch (error) {
    console.error("Error submitting solution:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit solution" });
  }
};

/**
 * Internal code execution helper - uses Wandbox API
 */
async function executeCodeInternal(code, language, input) {
  try {
    // Try Wandbox first
    const result = await executeWithWandbox(code, language, input);
    return {
      status: result.status,
      output: result.output,
      stderr: result.stderr || result.compileOutput,
    };
  } catch (error) {
    console.error("Wandbox error in internal execution:", error.message);

    // Try Rextester as fallback
    try {
      const result = await executeWithRextester(code, language, input);
      return {
        status: result.status,
        output: result.output,
        stderr: result.stderr,
      };
    } catch (err) {
      console.error("Rextester error in internal execution:", err.message);
      return {
        status: "error",
        output: "",
        stderr: "Execution service unavailable. Please try again.",
      };
    }
  }
}

/**
 * Get hint for a question
 * POST /api/practice/questions/:id/hint
 */
exports.getHint = async (req, res) => {
  try {
    const { id } = req.params;
    const { hintIndex = 0 } = req.body;
    const userId = req.user._id;

    const question = await PracticeQuestion.findById(id).select("hints");

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    if (!question.hints || question.hints.length === 0) {
      return res.json({
        success: true,
        hint: "No hints available for this question.",
      });
    }

    const index = Math.min(hintIndex, question.hints.length - 1);

    // Update user progress - track hints used
    await UserPracticeProgress.findOneAndUpdate(
      { user: userId, question: id },
      { $inc: { hintsUsed: 1 } },
      { upsert: true }
    );

    res.json({
      success: true,
      hint: question.hints[index],
      hintNumber: index + 1,
      totalHints: question.hints.length,
    });
  } catch (error) {
    console.error("Error getting hint:", error);
    res.status(500).json({ success: false, message: "Failed to get hint" });
  }
};

/**
 * Get solution for a question (marks as viewed)
 * GET /api/practice/questions/:id/solution
 */
exports.getSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const question = await PracticeQuestion.findById(id).select(
      "solutionCode explanation"
    );

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    // Mark solution as viewed in user progress
    await UserPracticeProgress.findOneAndUpdate(
      { user: userId, question: id },
      { viewedSolution: true },
      { upsert: true }
    );

    res.json({
      success: true,
      solution: question.solutionCode,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error("Error getting solution:", error);
    res.status(500).json({ success: false, message: "Failed to get solution" });
  }
};

/**
 * Get user's practice statistics
 * GET /api/practice/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await UserPracticeProgress.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalAttempted: { $sum: 1 },
          totalSolved: {
            $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] },
          },
          totalAttempts: { $sum: "$totalAttempts" },
          totalTimeSpent: { $sum: "$timeSpent" },
        },
      },
    ]);

    // Get category-wise breakdown
    const categoryStats = await UserPracticeProgress.aggregate([
      { $match: { user: userId, status: "solved" } },
      {
        $lookup: {
          from: "practicequestions",
          localField: "question",
          foreignField: "_id",
          as: "questionData",
        },
      },
      { $unwind: "$questionData" },
      {
        $group: {
          _id: "$questionData.category",
          solved: { $sum: 1 },
        },
      },
    ]);

    // Get total questions count
    const totalQuestions = await PracticeQuestion.countDocuments({
      isActive: true,
    });

    res.json({
      success: true,
      stats: {
        totalQuestions,
        attempted: stats[0]?.totalAttempted || 0,
        solved: stats[0]?.totalSolved || 0,
        totalAttempts: stats[0]?.totalAttempts || 0,
        timeSpent: stats[0]?.totalTimeSpent || 0,
        categoryBreakdown: categoryStats.map((c) => ({
          category: c._id,
          name: formatCategoryName(c._id),
          solved: c.solved,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get statistics" });
  }
};

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * Create a new practice question (Admin only)
 * POST /api/practice/admin/questions
 */
exports.createQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const question = new PracticeQuestion(questionData);
    await question.save();

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error("Error creating question:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create question" });
  }
};

/**
 * Update a practice question (Admin only)
 * PUT /api/practice/admin/questions/:id
 */
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await PracticeQuestion.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    res.json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    console.error("Error updating question:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update question" });
  }
};

/**
 * Delete a practice question (Admin only)
 * DELETE /api/practice/admin/questions/:id
 */
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await PracticeQuestion.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete question" });
  }
};
