/**
 * RAG Context Builder for Medha Chatbot
 * Fetches relevant context from MongoDB to inject into AI prompts
 * Now with dynamic university/branch support
 */

const User = require("../models/User");
const Syllabus = require("../models/Syllabus");
const Flashcard = require("../models/Flashcard");
const Note = require("../models/Note");
const Todo = require("../models/Todo");
const Topic = require("../models/Topic");
const Subject = require("../models/Subject");
const ExamAnalysis = require("../models/ExamAnalysis");
const UniversityContext = require("../models/UniversityContext");

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
 * Detects mentioned subject based on dynamic subject keywords
 */
function detectMentionedSubject(query, subjects) {
  const queryLower = query.toLowerCase();
  
  for (const subject of subjects) {
    // Check each keyword for this subject
    for (const keyword of subject.keywords || []) {
      if (queryLower.includes(keyword.toLowerCase())) {
        return subject.name;
      }
    }
    // Also check code
    if (subject.code && queryLower.includes(subject.code.toLowerCase())) {
      return subject.name;
    }
  }
  
  return null;
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
    universityContext: null, // Store the university context object
  };

  try {
    // Variables for dynamic context
    let userUniversity = null;
    let userBranch = null;
    let universityContextData = null;

    // 1. User Profile Context (including daily plan and university/branch)
    if (userId) {
      const user = await User.findById(userId).lean();
      if (user) {
        userUniversity = user.university;
        userBranch = user.branch;
        
        const userInfo = [];
        userInfo.push(`Name: ${user.name}`);
        if (user.university) userInfo.push(`University: ${user.university}`);
        if (user.college) userInfo.push(`College: ${user.college}`);
        if (user.branch) userInfo.push(`Branch: ${user.branch}`);
        if (user.gender) userInfo.push(`Gender: ${user.gender}`);
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

    // 2. Fetch University Context from Database
    if (userUniversity) {
      universityContextData = await UniversityContext.findForUser(
        userUniversity, 
        userBranch || "ALL",
        "3" // Default to 3rd semester for now
      );
    }
    
    // Fallback to generic context if no specific context found
    if (!universityContextData) {
      universityContextData = await UniversityContext.findOne({ 
        university: "OTHER", 
        isActive: true 
      });
    }
    
    context.universityContext = universityContextData;

    // 3. Syllabus Context (based on query keywords)
    const keywords = extractKeywords(userQuery);
    const matchedSyllabus = await searchSyllabus(keywords);
    
    if (matchedSyllabus.length > 0) {
      const universityLabel = userUniversity || "University";
      const syllabusLines = matchedSyllabus.map(match => 
        `- ${match.subject} (Unit ${match.unitNumber}: ${match.unitTitle}): ${match.topics.join(", ")}`
      );
      context.syllabusContext = `[RELEVANT SYLLABUS FROM ${universityLabel}]\n${syllabusLines.join("\n")}\n`;
    }

    // 4. User's Learning Context (subjects, flashcards, topics to review)
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

    // 5. Available Exam Subjects from Database Context
    if (universityContextData && universityContextData.subjects && universityContextData.subjects.length > 0) {
      const examSubjects = universityContextData.subjects.map(s => `${s.name} (${s.code})`).join(", ");
      const universityLabel = universityContextData.universityFullName || userUniversity || "University";
      context.syllabusContext += `\n[AVAILABLE ${userUniversity || "EXAM"} SUBJECTS]\n${examSubjects}\n`;
    }

    // 6. User's Tasks Context
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

    // 7. Chat History Memory (Long-term memory)
    const ChatSession = require("../models/ChatSession");
    if (userId) {
      const recentSessions = await ChatSession.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(3)
        .select("title messages")
        .lean();

      if (recentSessions.length > 0) {
        const historySummary = recentSessions.map(session => {
          // Get the last interaction from this session
          const lastMsgs = session.messages.slice(-2); 
          const summary = lastMsgs.map(m => `${m.role === 'user' ? 'User' : 'Medha'}: ${m.content.substring(0, 100)}...`).join("\n  ");
          return `- Topic: "${session.title}"\n  ${summary}`;
        }).join("\n");
        
        context.historyContext = `[RECENT CONVERSATION MEMORY]\n${historySummary}\n`;
      }
    }

    // 8. Dynamic Exam Schedule from Database
    let examScheduleContext = "";
    if (universityContextData && universityContextData.examSchedule && universityContextData.examSchedule.length > 0) {
      const universityLabel = universityContextData.universityFullName || userUniversity || "University";
      const semLabel = universityContextData.semester !== "ALL" ? ` ${universityContextData.semester}th SEM` : "";
      
      examScheduleContext = `\n[${userUniversity || "UNIVERSITY"}${semLabel} EXAM SCHEDULE]\n`;
      for (const exam of universityContextData.examSchedule) {
        examScheduleContext += `- ${exam.date}: ${exam.subject} (${exam.subjectCode})\n`;
      }
    }

    // 9. Exam Weightage Data (Dynamic - based on mentioned subject)
    let examWeightageContext = "";
    
    // Get subjects for matching from database context
    const subjectsForMatching = universityContextData?.subjects || [];
    const mentionedSubject = detectMentionedSubject(userQuery, subjectsForMatching);
    
    if (mentionedSubject) {
      try {
        const examData = await ExamAnalysis.findOne({ subjectName: mentionedSubject }).lean();
        
        if (examData && examData.years && examData.years.length > 0) {
          let weightageInfo = `\n[EXAM WEIGHTAGE DATA: ${mentionedSubject}]\n`;
          weightageInfo += `Total Paper Marks: ${examData.totalPaperMarks}\n\n`;
          
          // Sort years descending (most recent first)
          const sortedYears = examData.years
            .filter(y => y.units && y.units.length > 0)
            .sort((a, b) => b.year - a.year)
            .slice(0, 3); // Show last 3 years
          
          for (const yearData of sortedYears) {
            weightageInfo += `Year ${yearData.year}:\n`;
            
            // Sort units by marks (highest first)
            const sortedUnits = [...yearData.units].sort((a, b) => b.totalMarks - a.totalMarks);
            
            for (const unit of sortedUnits) {
              const percentage = ((unit.totalMarks / examData.totalPaperMarks) * 100).toFixed(1);
              weightageInfo += `  - Unit ${unit.unitSerial} (${unit.unitName}): ${unit.totalMarks} marks (${percentage}%)\n`;
            }
            
            // Highlight highest priority unit
            if (sortedUnits.length > 0) {
              const topUnit = sortedUnits[0];
              weightageInfo += `  → HIGHEST PRIORITY: Unit ${topUnit.unitSerial} (${topUnit.unitName}) with ${topUnit.totalMarks} marks\n`;
            }
            weightageInfo += "\n";
          }
          
          // Add study advice
          weightageInfo += `STUDY ADVICE for ${mentionedSubject}:\n`;
          weightageInfo += `- Focus on units with consistently higher marks across years.\n`;
          weightageInfo += `- The unit with highest marks should be your TOP priority.\n`;
          weightageInfo += `- Don't skip any unit, but allocate time proportionally to marks weightage.\n`;
          
          examWeightageContext = weightageInfo;
        }
      } catch (err) {
        console.error("Error fetching exam weightage:", err);
      }
    }

    // 10. Custom system prompt additions from database
    let customPromptAdditions = "";
    if (universityContextData && universityContextData.systemPromptAdditions) {
      customPromptAdditions = `\n[UNIVERSITY-SPECIFIC CONTEXT]\n${universityContextData.systemPromptAdditions}\n`;
    }

    // 11. Combine all context
    const contextParts = [
      context.userContext,
      customPromptAdditions,
      examScheduleContext,
      examWeightageContext,
      context.syllabusContext,
      context.learningContext,
      context.tasksContext,
      context.historyContext,
    ].filter(Boolean);

    if (contextParts.length > 0) {
      const universityLabel = userUniversity || "this user";
      context.fullContext = `
=== PERSONALIZED CONTEXT FOR ${universityLabel.toUpperCase()} STUDENT ===
${contextParts.join("\n")}
=== END OF CONTEXT ===

Use the above context to provide personalized, relevant answers. 
- You have access to the user's recent conversation topics; reference them if relevant to show continuity.
- If exam schedule is available, remind them of upcoming exams if they ask about dates or planning.
- When a subject is mentioned, USE THE EXAM WEIGHTAGE DATA to advise which units have higher marks historically and should be prioritized.
- Reference specific syllabus topics, user's progress, or tasks when applicable.
- Adapt your responses to the user's university context.
`;
    }

  } catch (error) {
    console.error("Error building RAG context:", error);
    // Return empty context on error - chatbot will still work
  }

  return context;
}

module.exports = { buildRAGContext, extractKeywords, searchSyllabus };

