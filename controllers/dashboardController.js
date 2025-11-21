const User = require("../models/User");
const Todo = require("../models/Todo");
const Quiz = require("../models/Quiz");
const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const Topic = require("../models/Topic");
const axios = require("axios");

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
    
    const systemPrompt = `You are an expert study coach. Create a concise, motivating daily plan paragraph for a student.
    The student has the following tasks to complete today:
    ${todoListText}
    
    ${prompt ? `The student also wants to focus on: ${prompt}` : ""}
    
    Write a single paragraph (max 150 words) that organizes these tasks into a logical flow, offers a quick tip for efficiency, and is encouraging. Do not use bullet points. Write it as a cohesive narrative.`;

    const apiKey = process.env.GROQ_API_KEY;
    const aiRes = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192", // Fast and good enough
        messages: [
            { role: "system", content: "You are a helpful study assistant." },
            { role: "user", content: systemPrompt }
        ],
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const planText = aiRes.data.choices[0]?.message?.content || "Could not generate plan.";

    // Save to user profile
    user.dailyPlan = planText;
    user.dailyPlanDate = new Date();
    await user.save();

    res.status(200).json({ plan: planText });
  } catch (err) {
    console.error("Error generating daily plan:", err);
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
