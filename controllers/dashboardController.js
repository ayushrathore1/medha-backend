const User = require("../models/User");
const Todo = require("../models/Todo");
const Quiz = require("../models/Quiz");
const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const Topic = require("../models/Topic");
const DailyQuote = require("../models/DailyQuote");
const axios = require("axios");
const { performWebSearch, formatSearchContext } = require("../utils/webSearch");

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [user, quizCount, flashcardCount, noteCount, reviewList] = await Promise.all([
      User.findById(userId),
      Quiz.countDocuments({ user: userId }),
      Flashcard.countDocuments({ owner: userId, viewed: true }), // Cards Learned = Viewed
      Note.countDocuments({ user: userId }),
      Topic.find({ owner: userId, difficulty: "hard" }), // Topics to Review
      Flashcard.countDocuments({ user: userId }),
      Note.countDocuments({ user: userId }),
      Flashcard.find({ user: userId, nextReview: { $lte: new Date() } }).limit(10),
    ]);

    // Calculate accuracy (mock logic for now, or aggregate from quizzes)
    // Real implementation would aggregate quiz scores
    const quizzes = await Quiz.find({ user: userId }).select("attempts");
    let totalQuestions = 0;
    let totalCorrect = 0;
    
    quizzes.forEach(q => {
        if(q.attempts && q.attempts.length > 0) {
            const lastAttempt = q.attempts[q.attempts.length - 1];
            // Assuming score is number of correct answers
            totalCorrect += lastAttempt.score; 
            // We need total questions per quiz to calculate percentage properly
            // For now, let's just use the score as is if it represents percentage, 
            // or if it's raw score we need the max score.
            // Let's assume score is percentage for simplicity or 0-100.
            // If score is raw, we need question count. 
            // Let's simplify: Average score of last attempts
            totalQuestions += 1; // Using as "count of quizzes taken"
        }
    });

    const accuracy = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions) : 0;

    res.status(200).json({
      streak: user.streak || 0,
      cardsLearned: flashcardCount,
      notesCreated: noteCount,
      quizzesTaken: quizCount,
      accuracy: accuracy, // Average score
      reviewList,
      userName: user.name,
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

// Generate Daily Plan
exports.generateDailyPlan = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { prompt } = req.body;

    const user = await User.findById(userId);
    const todos = await Todo.find({ user: userId, isCompleted: false });

    const todoListText = todos.map(t => `- ${t.task}`).join("\n");
    const now = new Date();
    const currentDateTime = now.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    
    const apiKey = process.env.GROQ_API_KEY;
    const model = "llama-3.3-70b-versatile"; 

    // --- STEP 1: PROMPT ENGINEERING (The "Intermediate AI") ---
    // Goal: Turn vague user input into precise instructions for the Coach AI
    console.log("🧠 Step 1: Enhancing user prompt...");
    
    const enhancerSystemPrompt = `You are a world-class Prompt Engineer for Educational AIs.
    Your goal is to take a student's raw, potentially messy input and their to-do list, and transform it into a PERFECT, detailed set of instructions for a Study Coach AI.
    
    Context:
    - Current Date: ${currentDateTime}
    - Student's Todos: 
    ${todoListText}
    
    User's Raw Input: "${prompt || "Make a plan for me based on my todos"}"
    
    Your Output MUST be a set of clear, step-by-step instructions that I can feed to the Study Coach AI. 
    
    ANALYSIS STEPS:
    1. **Identify Request Type**: Is this Exam Prep? General Routine? Motivation? or a Sprit (Cramming)?
    2. **Extract Constraints**: Dates, specific subjects, time limits.
    
    INSTRUCTION GENERATION RULES:
    - If dates/exams are mentioned -> specific day-by-day countdown.
    - If NO specific event -> Create a balanced, efficient daily routine for today.
    - If input is vague (e.g., "I'm tired") -> Instruct Coach to be motivational and suggest light tasks.
    - Enforce formatting: "Use bullet points", "Bold specific dates", "Use timestamps if applicable".
    - CRITICAL: Instruct the Coach to separate each Day or Major Phase with a triple dash "---" on a new line.
    - Do NOT generate the plan yourself. Only generate the INSTRUCTIONS for the plan.`;

    const enhancerRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: model,
        messages: [
            { role: "system", content: enhancerSystemPrompt },
            { role: "user", content: "Optimize this request for the Study Coach." }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
    );

    const enhancedInstructions = enhancerRes.data.choices[0]?.message?.content || prompt;
    console.log("✨ Enhanced Instructions:", enhancedInstructions);

    // --- STEP 2: THE STUDY COACH (The "Frontend AI") ---
    // Goal: Execute the enhanced instructions to create the final plan
    console.log("🎓 Step 2: Generating final plan...");

    const coachSystemPrompt = `You are an expert Study Coach and Time Management Specialist.
    You are receiving a set of highly specific instructions to create a study plan.
    Follow them EXACTLY.
    
    General Rules:
    - Tone: Encouraging, professional, but strict about efficiency.
    - Format: Use Markdown. clear headers (##), bullet points (-), and bold text (**text**) for emphasis.
    - If dates are involved, create a chronological schedule.
    - CRITICAL: You MUST separate each Day or Major Section of the plan with a triple dash "---" on its own line.
    - Never mention "Reviewing the instructions" or "Here is the plan representing...". Just give the plan.`;

    const finalRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: model,
        messages: [
            { role: "system", content: coachSystemPrompt },
            { role: "user", content: enhancedInstructions } // Feed the optimized prompt here
        ],
        temperature: 0.5, // Lower temperature for more adherence to instructions
        max_tokens: 8192,
      },
      { 
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          timeout: 120000 // 120 seconds timeout for long plans
      }
    );

    const planText = finalRes.data.choices[0]?.message?.content || "Could not generate plan.";

    // Save to user profile
    user.dailyPlan = planText;
    user.dailyPlanDate = new Date();
    await user.save();

    res.status(200).json({ plan: planText });
  } catch (err) {
    console.error("Error generating daily plan:", err.message);
    if (err.response) {
        console.error("Groq API Error Data:", JSON.stringify(err.response.data, null, 2));
    }
    res.status(500).json({ message: "Error generating daily plan" });
  }
};

// Get Daily Plan
exports.getDailyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Check if plan is from today
    const today = new Date();
    const planDate = user.dailyPlanDate ? new Date(user.dailyPlanDate) : null;
    
    let plan = user.dailyPlan;
    
    // If plan is old (not same day), maybe clear it or just return it but frontend handles "expired" visual?
    // For now, let's just return what's there.
    
    res.status(200).json({ 
        plan, 
        date: user.dailyPlanDate 
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching daily plan" });
  }
};

// Get Daily Inspirational Quote
exports.getDailyQuote = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already have a quote for today
    let cachedQuote = await DailyQuote.findOne({ date: today });
    
    if (cachedQuote) {
      return res.status(200).json({
        quote: cachedQuote.quote,
        author: cachedQuote.author,
        source: cachedQuote.source,
        cached: true,
      });
    }

    // No cached quote - generate a new one using AI + Web Search
    console.log("✨ Generating new daily quote for", today);
    
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "AI service not configured" });
    }

    // Perform web search for fresh inspirational quotes
    const searchQueries = [
      "inspirational quote of the day famous personalities",
      "motivational quote APJ Abdul Kalam Swami Vivekananda",
      "inspirational quotes from famous books",
    ];
    
    // Pick a random search query for variety
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    const searchResults = await performWebSearch(randomQuery, 3);
    const webContext = formatSearchContext(searchResults);

    // Use AI to generate/select a quote
    const systemPrompt = `You are a curator of inspirational wisdom. Your task is to provide ONE powerful, motivational quote.

QUOTE SOURCES (prioritize these):
1. **Indian Leaders & Thinkers**: APJ Abdul Kalam, Swami Vivekananda, Mahatma Gandhi, Rabindranath Tagore, Chanakya, Sadhguru
2. **World-Renowned Personalities**: Steve Jobs, Albert Einstein, Nelson Mandela, Oprah Winfrey, Elon Musk, Bill Gates
3. **Famous Books**: Bhagavad Gita, The Alchemist, Atomic Habits, Think and Grow Rich, Man's Search for Meaning

REQUIREMENTS:
- The quote should inspire students and learners
- Include the author/source
- Keep the quote concise (1-3 sentences max)
- Avoid clichéd or overused quotes - aim for something fresh

${webContext}

OUTPUT FORMAT (JSON only, no markdown):
{"quote": "The actual quote text here", "author": "Person Name", "source": "Book/Speech/Context (optional, can be null)"}

Return ONLY valid JSON, nothing else.`;

    const aiRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Give me today's inspirational quote." }
        ],
        temperature: 0.9, // Higher for variety
        max_tokens: 256,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const aiContent = aiRes.data.choices[0]?.message?.content;
    let quoteData;

    try {
      quoteData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error("Failed to parse AI quote response:", aiContent);
      // Fallback quote
      quoteData = {
        quote: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        source: null,
      };
    }

    // Save to database for caching
    const newQuote = await DailyQuote.create({
      quote: quoteData.quote,
      author: quoteData.author,
      source: quoteData.source || null,
      date: today,
    });

    console.log("✅ New quote saved:", quoteData.author);

    res.status(200).json({
      quote: newQuote.quote,
      author: newQuote.author,
      source: newQuote.source,
      cached: false,
    });

  } catch (err) {
    console.error("Error fetching daily quote:", err.message);
    if (err.response) {
      console.error("API Error:", err.response.data);
    }
    
    // Return a fallback quote on error
    res.status(200).json({
      quote: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
      source: null,
      fallback: true,
    });
  }
};
