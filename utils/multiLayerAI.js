/**
 * Multi-Layer AI Solution Pipeline
 * Provides comprehensive, question-specific solutions through 6 AI processing layers
 */

const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;

// Initialize Gemini client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// AI Models configuration
const MODELS = {
  fast: "llama-3.1-8b-instant",      // Fast model for quick decisions
  standard: "llama-3.3-70b-versatile", // Standard model for generation
  gemini: "gemini-2.0-flash-exp"      // Gemini flash for speed
};

/**
 * Helper to call Groq API
 */
async function callGroq(prompt, maxTokens = 2000, temperature = 0.3, model = MODELS.standard) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 60000,
    }
  );
  return response.data.choices[0].message.content;
}

/**
 * Helper to call Gemini API
 */
async function callGemini(prompt, maxTokens = 2000) {
  if (!genAI) throw new Error("Gemini not configured");
  
  const model = genAI.getGenerativeModel({ model: MODELS.gemini });
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.3 }
  });
  return result.response.text();
}

/**
 * LAYER 1: Question Analyzer
 * Analyzes the question structure, type, and requirements
 */
async function analyzeQuestion(question, subject, unit, marks) {
  const startTime = Date.now();
  
  const prompt = `You are an expert RTU exam question analyzer. Analyze this question and provide ONLY a valid JSON response.

QUESTION: "${question}"
SUBJECT: ${subject}
UNIT: ${unit}
MARKS: ${marks}

Analyze and respond with ONLY this JSON (no markdown, no explanation):
{
  "questionType": "definition|numerical|derivation|comparison|diagram|code|theory|application|short_answer",
  "subTypes": ["list any sub-types like 'explain', 'derive', 'compare', 'draw'"],
  "complexity": "low|medium|high",
  "expectedFormat": "bullet_points|numbered_steps|paragraph|table|diagram_with_explanation|code_with_explanation|proof_steps",
  "keyTopics": ["main topic 1", "main topic 2"],
  "keyTerms": ["term1", "term2"],
  "estimatedWritingTime": "5|10|15|20",
  "marksBreakdown": {
    "introduction": 1,
    "mainContent": ${Math.max(1, (marks || 5) - 2)},
    "conclusion": 1
  },
  "needsDiagram": true|false,
  "needsCode": true|false,
  "needsFormulas": true|false,
  "needsTable": true|false,
  "needsSteps": true|false,
  "difficultyReason": "brief explanation of why this difficulty",
  "answerHints": ["hint 1 for answering", "hint 2"]
}`;

  try {
    const result = await callGroq(prompt, 1000, 0.1, MODELS.fast);
    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: analysis,
        time: Date.now() - startTime
      };
    }
    throw new Error("Invalid JSON response");
  } catch (error) {
    console.error("Layer 1 (Analyzer) error:", error.message);
    // Return default analysis on error
    return {
      success: false,
      data: {
        questionType: "theory",
        complexity: "medium",
        expectedFormat: "paragraph",
        keyTopics: [subject],
        needsDiagram: false,
        needsCode: false,
        needsFormulas: false,
        needsTable: false,
        needsSteps: false
      },
      time: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * LAYER 2: Initial Solution Generator
 * Generates the first draft of the solution with well-structured formatting
 */
async function generateInitialSolution(question, subject, unit, marks, analysis, webContext = "") {
  const startTime = Date.now();
  
  const formatInstructions = getFormatInstructions(analysis.data);
  
  const prompt = `You are an expert RTU (Rajasthan Technical University) exam tutor. Generate a complete, exam-ready solution that is WELL-STRUCTURED with clear paragraph separation.

## Question Details
- **Subject:** ${subject}
- **Unit:** ${unit}  
- **Marks:** ${marks}
- **Question Type:** ${analysis.data.questionType}
- **Expected Format:** ${analysis.data.expectedFormat}

## Question
${question}

${webContext}

## CRITICAL FORMATTING REQUIREMENTS

### Structure your answer with CLEAR SECTIONS:

${analysis.data.questionType === "definition" || analysis.data.questionType === "theory" ? `
**1. DEFINITION SECTION:**
- Start with a clear, concise definition in its own paragraph
- Follow with an expanded explanation in a separate paragraph
- Add key characteristics in bullet points
- Include practical significance in another paragraph
` : ""}

${analysis.data.needsFormulas ? `
**2. FORMULAS/EQUATIONS SECTION:**
- List all relevant formulas in a dedicated section with heading "## Key Formulas"
- Each formula should be on its own line
- Use LaTeX notation: $formula$ for inline, $$formula$$ for display
- Explain what each variable represents below the formula
` : ""}

${analysis.data.needsDiagram ? `
**3. DIAGRAM SECTION:**
Under a heading "## How to Draw the Diagram", provide:
- **Step 1:** Start with... (first drawing step)
- **Step 2:** Next, draw... (second step)
- **Step 3:** Add... (continue steps)
- **Step 4:** Label... (labeling instructions)
- **Important:** Include specific measurements/proportions if relevant
- **Note:** Describe what the final diagram should look like
` : ""}

${analysis.data.needsCode ? `
**4. CODE SECTION:**
- Provide complete, working code under heading "## Code Implementation"
- Add comments explaining each section
- Show sample input/output if applicable
` : ""}

${analysis.data.needsTable ? `
**5. COMPARISON/TABLE SECTION:**
- Use proper markdown table format
- Include at least 5-6 comparison points
- Cover: definition, features, applications, advantages  
` : ""}

### General Structure Rules:
1. **Use clear headings** (## for main sections, ### for subsections)
2. **Separate paragraphs** with blank lines - DO NOT write one long paragraph
3. **Use bullet points** for listing features, characteristics, advantages
4. **Use numbered lists** for procedures or steps
5. **Bold key terms** for emphasis
6. ${analysis.data.needsSteps ? "**Number each step** clearly for procedures" : ""}

## Content Requirements
- Cover all key topics: ${(analysis.data.keyTopics || []).join(", ")}
- The answer should demonstrate ${marks}-mark worthy depth
- Writing time: approximately ${analysis.data.estimatedWritingTime || 10} minutes

## Final Structure Check:
- Introduction/Definition paragraph
- Main content (with appropriate sub-sections based on question type)
- Examples or applications paragraph
- Summary/Conclusion (if applicable)

Generate the COMPLETE, WELL-STRUCTURED answer now:`;

  try {
    const solution = await callGroq(prompt, 3500, 0.4);
    return {
      success: true,
      data: solution,
      time: Date.now() - startTime
    };
  } catch (error) {
    console.error("Layer 2 (Generator) error:", error.message);
    return {
      success: false,
      data: null,
      time: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * LAYER 3: Solution Reviewer (Critic AI)
 * Reviews the solution and provides structured feedback
 */
async function reviewSolution(question, solution, marks, analysis) {
  const startTime = Date.now();
  
  const prompt = `You are a strict RTU exam evaluator. Review this solution and provide detailed feedback.

## Original Question (${marks} marks)
${question}

## Question Type: ${analysis.data.questionType}
## Expected Format: ${analysis.data.expectedFormat}

## Student's Answer
${solution}

## Evaluation Criteria
1. **Completeness** - Does it cover all required points for ${marks} marks?
2. **Accuracy** - Are all facts, formulas, and concepts correct?
3. **Structure** - Is the answer well-organized for RTU exam format?
4. **Diagrams** - ${analysis.data.needsDiagram ? "Are diagram descriptions complete and labeled?" : "N/A"}
5. **Formulas** - ${analysis.data.needsFormulas ? "Are all formulas correctly stated?" : "N/A"}
6. **Examples** - Are relevant examples provided?

Respond with ONLY this JSON (no markdown, no explanation):
{
  "overallScore": 7,
  "estimatedMarks": "${marks - 1}/${marks}",
  "strengths": [
    "Strength 1",
    "Strength 2"
  ],
  "weaknesses": [
    "Weakness 1 - specific issue",
    "Weakness 2 - specific issue"
  ],
  "factualErrors": [
    "Error 1 if any - or empty array"
  ],
  "missingPoints": [
    "Missing point 1",
    "Missing point 2"
  ],
  "improvementSuggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2"  
  ],
  "examinerTips": [
    "RTU specific tip 1",
    "RTU specific tip 2"
  ]
}`;

  try {
    const result = await callGroq(prompt, 1500, 0.2, MODELS.fast);
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const feedback = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: feedback,
        time: Date.now() - startTime
      };
    }
    throw new Error("Invalid JSON response");
  } catch (error) {
    console.error("Layer 3 (Reviewer) error:", error.message);
    return {
      success: false,
      data: {
        overallScore: 7,
        strengths: ["Answer provided"],
        weaknesses: [],
        missingPoints: [],
        improvementSuggestions: []
      },
      time: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * LAYER 4: RTU Web Research
 * Searches for RTU-specific patterns and preferred answer formats
 */
async function searchRTUPatterns(question, subject, unit) {
  const startTime = Date.now();
  
  if (!SERP_API_KEY) {
    return {
      success: false,
      data: { context: "" },
      time: Date.now() - startTime,
      error: "SERP API not configured"
    };
  }
  
  try {
    // Search for RTU specific content
    const searchQuery = `RTU ${subject} ${question.substring(0, 50)} exam answer format`;
    
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        api_key: SERP_API_KEY,
        q: searchQuery,
        engine: "google",
        num: 5,
        hl: "en",
        gl: "in",
      },
      timeout: 8000,
    });
    
    let context = "\n[RTU EXAM PATTERN RESEARCH]\n";
    
    if (response.data.answer_box) {
      context += `Direct Answer: ${response.data.answer_box.answer || response.data.answer_box.snippet}\n\n`;
    }
    
    if (response.data.organic_results) {
      context += "Related RTU Resources:\n";
      response.data.organic_results.slice(0, 3).forEach((r, i) => {
        context += `${i + 1}. ${r.title}\n   ${r.snippet}\n\n`;
      });
    }
    
    context += "[END RTU RESEARCH]\n";
    
    return {
      success: true,
      data: { 
        context,
        resultsCount: response.data.organic_results?.length || 0
      },
      time: Date.now() - startTime
    };
  } catch (error) {
    console.error("Layer 4 (RTU Research) error:", error.message);
    return {
      success: false,
      data: { context: "" },
      time: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * LAYER 5: Solution Optimizer
 * Regenerates solution based on feedback and RTU context with proper structure
 */
async function optimizeSolution(question, initialSolution, feedback, rtuContext, marks, analysis) {
  const startTime = Date.now();
  
  const prompt = `You are an expert RTU exam answer optimizer. Improve this answer while maintaining EXCELLENT STRUCTURE with clear paragraph separation.

## Original Question (${marks} marks)
${question}

## Current Answer
${initialSolution}

## Reviewer Feedback
- **Score:** ${feedback.data.overallScore}/10
- **Strengths:** ${(feedback.data.strengths || []).join(", ")}
- **Weaknesses:** ${(feedback.data.weaknesses || []).join("; ")}
- **Missing Points:** ${(feedback.data.missingPoints || []).join("; ")}
- **Suggestions:** ${(feedback.data.improvementSuggestions || []).join("; ")}

${rtuContext.data?.context || ""}

## Your Task
Rewrite and OPTIMIZE the answer to:
1. Fix all identified weaknesses
2. Add all missing points
3. Implement all improvement suggestions
4. Ensure it deserves FULL ${marks} marks

## CRITICAL: MAINTAIN STRUCTURED FORMAT

${analysis.data.questionType === "definition" || analysis.data.questionType === "theory" ? `
**DEFINITION SECTION:** Start with clear definition paragraph, then expanded explanation in separate paragraphs
` : ""}

${analysis.data.needsFormulas ? `
**FORMULAS SECTION:** Include "## Key Formulas" section with each formula on its own line using LaTeX notation
` : ""}

${analysis.data.needsDiagram ? `
**DIAGRAM SECTION:** Include "## How to Draw the Diagram" with step-by-step instructions:
- Step 1, Step 2, Step 3... for drawing
- Include labeling instructions
- Describe final appearance
` : ""}

${analysis.data.needsCode ? `
**CODE SECTION:** Include complete code with "## Code Implementation" heading
` : ""}

${analysis.data.needsTable ? `
**TABLE SECTION:** Use proper markdown tables for comparisons
` : ""}

## Structure Rules:
- Use clear headings (## and ###)  
- Separate paragraphs with blank lines
- Use bullet points for features/characteristics
- Bold key terms
- DO NOT write long, unbroken paragraphs

Generate the OPTIMIZED, WELL-STRUCTURED answer:`;

  try {
    const optimizedSolution = await callGroq(prompt, 4000, 0.3);
    return {
      success: true,
      data: optimizedSolution,
      time: Date.now() - startTime
    };
  } catch (error) {
    console.error("Layer 5 (Optimizer) error:", error.message);
    // Return initial solution if optimization fails
    return {
      success: false,
      data: initialSolution,
      time: Date.now() - startTime,
      error: error.message
    };
  }
}

/**
 * LAYER 6: Dynamic UI Template Selector
 * Determines the best UI template based on question type
 */
async function determineDynamicUI(analysis, solution) {
  const startTime = Date.now();
  
  const questionType = analysis.data.questionType || "theory";
  const needsDiagram = analysis.data.needsDiagram;
  const needsCode = analysis.data.needsCode;
  const needsFormulas = analysis.data.needsFormulas;
  const needsTable = analysis.data.needsTable;
  const needsSteps = analysis.data.needsSteps;
  
  // Determine primary UI template
  let uiTemplate = "default";
  let uiConfig = {
    showDiagramPlaceholder: false,
    showCodeBlocks: false,
    showFormulaHighlight: false,
    showStepNumbers: false,
    showComparisonTable: false,
    primaryColor: "indigo",
    accentColor: "violet",
    layout: "standard"
  };
  
  switch (questionType) {
    case "numerical":
      uiTemplate = "numerical_steps";
      uiConfig = {
        ...uiConfig,
        showStepNumbers: true,
        showFormulaHighlight: true,
        primaryColor: "blue",
        accentColor: "cyan",
        layout: "steps"
      };
      break;
      
    case "derivation":
      uiTemplate = "derivation_proof";
      uiConfig = {
        ...uiConfig,
        showStepNumbers: true,
        showFormulaHighlight: true,
        primaryColor: "purple",
        accentColor: "pink",
        layout: "proof"
      };
      break;
      
    case "comparison":
      uiTemplate = "comparison_table";
      uiConfig = {
        ...uiConfig,
        showComparisonTable: true,
        primaryColor: "teal",
        accentColor: "emerald",
        layout: "table"
      };
      break;
      
    case "diagram":
      uiTemplate = "diagram_explanation";
      uiConfig = {
        ...uiConfig,
        showDiagramPlaceholder: true,
        primaryColor: "orange",
        accentColor: "amber",
        layout: "visual"
      };
      break;
      
    case "code":
      uiTemplate = "code_solution";
      uiConfig = {
        ...uiConfig,
        showCodeBlocks: true,
        primaryColor: "green",
        accentColor: "lime",
        layout: "code"
      };
      break;
      
    case "definition":
      uiTemplate = "definition_card";
      uiConfig = {
        ...uiConfig,
        primaryColor: "sky",
        accentColor: "blue",
        layout: "card"
      };
      break;
      
    case "application":
      uiTemplate = "application_case";
      uiConfig = {
        ...uiConfig,
        primaryColor: "rose",
        accentColor: "red",
        layout: "case_study"
      };
      break;
      
    default:
      uiTemplate = "theory_standard";
      uiConfig = {
        ...uiConfig,
        primaryColor: "indigo",
        accentColor: "violet",
        layout: "standard"
      };
  }
  
  // Override based on specific needs
  if (needsDiagram) uiConfig.showDiagramPlaceholder = true;
  if (needsCode) uiConfig.showCodeBlocks = true;
  if (needsFormulas) uiConfig.showFormulaHighlight = true;
  if (needsTable) uiConfig.showComparisonTable = true;
  if (needsSteps) uiConfig.showStepNumbers = true;
  
  return {
    success: true,
    data: {
      template: uiTemplate,
      config: uiConfig,
      questionType
    },
    time: Date.now() - startTime
  };
}

/**
 * Get format-specific instructions based on analysis
 */
function getFormatInstructions(analysis) {
  const instructions = [];
  
  switch (analysis.questionType) {
    case "numerical":
      instructions.push("- Show step-by-step calculation with each step numbered");
      instructions.push("- Write formulas clearly before substituting values");
      instructions.push("- Box or highlight the final answer");
      instructions.push("- Include units in all calculations");
      break;
      
    case "derivation":
      instructions.push("- Start with the fundamental equation or principle");
      instructions.push("- Show each mathematical step clearly");
      instructions.push("- Number each step of the derivation");
      instructions.push("- Clearly state 'Hence Proved' or final derived equation");
      break;
      
    case "comparison":
      instructions.push("- Use a proper comparison table format");
      instructions.push("- Include at least 5-6 comparison points");
      instructions.push("- Cover: definition, features, applications, advantages, disadvantages");
      break;
      
    case "diagram":
      instructions.push("- Describe the diagram in detail with labels");
      instructions.push("- Use format: [DIAGRAM: Description of what to draw]");
      instructions.push("- Explain each part of the diagram");
      break;
      
    case "code":
      instructions.push("- Provide complete, working code");
      instructions.push("- Add comments explaining each section");
      instructions.push("- Include sample input/output if applicable");
      break;
      
    case "definition":
      instructions.push("- Start with a clear, concise definition");
      instructions.push("- Expand with key features and characteristics");
      instructions.push("- Include real-world examples");
      break;
      
    default:
      instructions.push("- Use clear headings and subheadings");
      instructions.push("- Include bullet points for key features");
      instructions.push("- Add examples where relevant");
  }
  
  return instructions.join("\n");
}

/**
 * Main pipeline function - runs all 6 layers
 */
async function runMultiLayerPipeline(question, subject, unit, marks, selectedModel = "groq") {
  console.log("🚀 Starting Multi-Layer AI Pipeline...");
  const pipelineStart = Date.now();
  
  const results = {
    success: true,
    solution: null,
    analysis: null,
    feedback: null,
    uiTemplate: null,
    metadata: {
      layers: {},
      totalTime: 0,
      model: selectedModel
    }
  };
  
  try {
    // LAYER 1: Analyze Question
    console.log("📊 Layer 1: Analyzing question...");
    const analysis = await analyzeQuestion(question, subject, unit, marks);
    results.analysis = analysis.data;
    results.metadata.layers.analyzer = { time: analysis.time, success: analysis.success };
    
    // LAYER 4: RTU Web Research (parallel with Layer 2)
    console.log("🌐 Layer 4: Researching RTU patterns...");
    const rtuResearchPromise = searchRTUPatterns(question, subject, unit);
    
    // LAYER 2: Generate Initial Solution
    console.log("✍️ Layer 2: Generating initial solution...");
    const rtuResearch = await rtuResearchPromise;
    const initialSolution = await generateInitialSolution(
      question, subject, unit, marks, analysis, rtuResearch.data?.context || ""
    );
    results.metadata.layers.generator = { time: initialSolution.time, success: initialSolution.success };
    results.metadata.layers.researcher = { time: rtuResearch.time, success: rtuResearch.success };
    
    if (!initialSolution.success || !initialSolution.data) {
      throw new Error("Failed to generate initial solution");
    }
    
    // LAYER 3: Review Solution
    console.log("🔍 Layer 3: Reviewing solution...");
    const feedback = await reviewSolution(question, initialSolution.data, marks, analysis);
    results.feedback = feedback.data;
    results.metadata.layers.reviewer = { time: feedback.time, success: feedback.success };
    
    // LAYER 5: Optimize Solution (only if score < 9)
    let finalSolution = initialSolution.data;
    if (feedback.data?.overallScore < 9) {
      console.log("⚡ Layer 5: Optimizing solution...");
      const optimized = await optimizeSolution(
        question, initialSolution.data, feedback, rtuResearch, marks, analysis
      );
      finalSolution = optimized.data || initialSolution.data;
      results.metadata.layers.optimizer = { time: optimized.time, success: optimized.success };
    } else {
      console.log("✅ Layer 5: Skipped (score already high)");
      results.metadata.layers.optimizer = { time: 0, success: true, skipped: true };
    }
    
    // LAYER 6: Determine UI Template
    console.log("🎨 Layer 6: Determining UI template...");
    const uiResult = await determineDynamicUI(analysis, finalSolution);
    results.uiTemplate = uiResult.data;
    results.metadata.layers.uiRenderer = { time: uiResult.time, success: uiResult.success };
    
    results.solution = finalSolution;
    results.metadata.totalTime = Date.now() - pipelineStart;
    
    console.log(`✅ Pipeline complete in ${results.metadata.totalTime}ms`);
    
  } catch (error) {
    console.error("❌ Pipeline error:", error.message);
    results.success = false;
    results.error = error.message;
    results.metadata.totalTime = Date.now() - pipelineStart;
  }
  
  return results;
}

module.exports = {
  runMultiLayerPipeline,
  analyzeQuestion,
  generateInitialSolution,
  reviewSolution,
  searchRTUPatterns,
  optimizeSolution,
  determineDynamicUI
};
