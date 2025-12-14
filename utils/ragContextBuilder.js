/**
 * RAG Context Builder for Medha Chatbot
 * Fetches relevant context from MongoDB to inject into AI prompts
 */

const User = require("../models/User");
const Syllabus = require("../models/Syllabus");
const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const Todo = require("../models/Todo");
const Topic = require("../models/Topic");
const Subject = require("../models/Subject");

/**
 * Extracts keywords from user query for syllabus matching
 */
function extractKeywords(query) {
  // Common stop words to ignore
  const stopWords = new Set([
    "what", "is", "are", "the", "a", "an", "in", "on", "for", "to", "of",
    "and", "or", "how", "why", "when", "where", "which", "who", "explain",
    "tell", "me", "about", "can", "you", "please", "help", "with", "this",
    "that", "it", "be", "do", "does", "did", "have", "has", "had", "i", "my"
  ]);
  
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Searches syllabus for topics matching keywords
 */
async function searchSyllabus(keywords) {
  if (!keywords.length) return [];
  
  // Create regex patterns for each keyword
  const regexPatterns = keywords.map(kw => new RegExp(kw, "i"));
  
  // Find syllabi where any unit topic matches any keyword
  const syllabi = await Syllabus.find({}).lean();
  
  const matchedTopics = [];
  
  for (const syllabus of syllabi) {
    for (const unit of syllabus.units) {
      const matchingTopics = unit.topics.filter(topic => 
        regexPatterns.some(regex => regex.test(topic))
      );
      
      if (matchingTopics.length > 0) {
        matchedTopics.push({
          subject: syllabus.subjectName,
          subjectCode: syllabus.subjectCode,
          unitNumber: unit.unitNumber,
          unitTitle: unit.title,
          topics: matchingTopics.slice(0, 5), // Limit topics per unit
        });
      }
    }
  }
  
  return matchedTopics.slice(0, 3); // Return top 3 matching units
}

/**
 * Builds complete RAG context for the chatbot
 * @param {string|null} userId - User ID from JWT (null if unauthenticated)
 * @param {string} userQuery - The user's question
 * @returns {Object} Context object with formatted strings
 */
async function buildRAGContext(userId, userQuery) {
  const context = {
    userContext: "",
    syllabusContext: "",
    learningContext: "",
    tasksContext: "",
    fullContext: "",
  };

  try {
    // 1. User Profile Context (including daily plan)
    if (userId) {
      const user = await User.findById(userId).lean();
      if (user) {
        const userInfo = [];
        userInfo.push(`Name: ${user.name}`);
        if (user.college) userInfo.push(`College: ${user.college}`);
        if (user.branch) userInfo.push(`Branch: ${user.branch}`);
        if (user.year) userInfo.push(`Year: ${user.year}`);
        if (user.streak > 0) userInfo.push(`Study Streak: ${user.streak} days`);
        
        context.userContext = `[USER PROFILE]\n${userInfo.join(", ")}\n`;
        
        // Add daily plan if exists
        if (user.dailyPlan && user.dailyPlanDate) {
          const planDate = new Date(user.dailyPlanDate);
          const today = new Date();
          const isToday = planDate.toDateString() === today.toDateString();
          
          if (isToday) {
            context.userContext += `\n[TODAY'S STUDY PLAN]\n${user.dailyPlan.substring(0, 500)}...\n`;
          }
        }
      }
    }

    // 2. Syllabus Context (based on query keywords)
    const keywords = extractKeywords(userQuery);
    const matchedSyllabus = await searchSyllabus(keywords);
    
    if (matchedSyllabus.length > 0) {
      const syllabusLines = matchedSyllabus.map(match => 
        `- ${match.subject} (Unit ${match.unitNumber}: ${match.unitTitle}): ${match.topics.join(", ")}`
      );
      context.syllabusContext = `[RELEVANT SYLLABUS FROM RTU]\n${syllabusLines.join("\n")}\n`;
    }

    // 3. User's Learning Context (subjects, flashcards, topics to review)
    if (userId) {
      // Get user's subjects
      const subjects = await Subject.find({ owner: userId }).lean();
      
      // Get user's topics - including those marked for review
      const topics = await Topic.find({ owner: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      
      // Get topics marked for review (hard difficulty)
      const reviewTopics = topics.filter(t => t.difficulty === 'hard');
      
      // Get recent flashcards
      const flashcards = await Flashcard.find({ owner: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("front subject topic")
        .lean();
      
      // Get user's notes
      const notes = await Note.find({ owner: userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .select("title subject")
        .lean();
      
      const learningItems = [];
      
      if (subjects.length > 0) {
        learningItems.push(`Enrolled Subjects: ${subjects.map(s => s.name).join(", ")}`);
      }
      
      if (reviewTopics.length > 0) {
        learningItems.push(`Topics to Review (marked as hard): ${reviewTopics.map(t => t.name).join(", ")}`);
      }
      
      if (topics.length > 0) {
        const recentTopics = topics.slice(0, 5);
        learningItems.push(`Recent Topics Studied: ${recentTopics.map(t => `${t.name} (${t.difficulty})`).join(", ")}`);
      }
      
      if (flashcards.length > 0) {
        const flashcardSummary = flashcards
          .filter(f => f.front)
          .map(f => f.front.substring(0, 30) + "...")
          .join("; ");
        if (flashcardSummary) {
          learningItems.push(`Recent Flashcards: ${flashcardSummary}`);
        }
      }
      
      if (notes.length > 0) {
        learningItems.push(`Recent Notes: ${notes.map(n => n.title).join(", ")}`);
      }
      
      if (learningItems.length > 0) {
        context.learningContext = `[USER'S LEARNING PROGRESS]\n${learningItems.join("\n")}\n`;
      }
    }

    // 4. Available RTU Exam Subjects
    const allSyllabi = await Syllabus.find({}).select("subjectName subjectCode").lean();
    if (allSyllabi.length > 0) {
      const examSubjects = allSyllabi.map(s => `${s.subjectName} (${s.subjectCode})`).join(", ");
      context.syllabusContext += `\n[AVAILABLE RTU EXAM SUBJECTS]\n${examSubjects}\n`;
    }

    // 5. User's Tasks Context
    if (userId) {
      const todos = await Todo.find({ user: userId, isCompleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      
      if (todos.length > 0) {
        const taskList = todos.map(t => `- ${t.task}`).join("\n");
        context.tasksContext = `[PENDING TASKS]\n${taskList}\n`;
      }
    }

    // 5. Combine all context
    const contextParts = [
      context.userContext,
      context.syllabusContext,
      context.learningContext,
      context.tasksContext,
    ].filter(Boolean);

    if (contextParts.length > 0) {
      context.fullContext = `
=== PERSONALIZED CONTEXT FOR THIS USER ===
${contextParts.join("\n")}
=== END OF CONTEXT ===

Use the above context to provide personalized, relevant answers. Reference specific syllabus topics, user's progress, or tasks when applicable.
`;
    }

  } catch (error) {
    console.error("Error building RAG context:", error);
    // Return empty context on error - chatbot will still work
  }

  return context;
}

module.exports = { buildRAGContext, extractKeywords, searchSyllabus };
