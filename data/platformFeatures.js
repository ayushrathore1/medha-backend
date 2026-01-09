/**
 * Medha AI - Platform Features Context
 * Used by Admin AI to generate email updates
 */

const PLATFORM_FEATURES = `
MEDHA AI - Smart Study Companion for RTU Students

CORE PURPOSE:
Medha AI is an intelligent study assistant specifically designed for Rajasthan Technical University (RTU) computer science students. It bridges the gap between static study material and interactive learning.

KEY FEATURES:

1. AI CHATBOT WITH WEB ACCESS (NEW)
   - Real-time web searching capabilities.
   - Can answer questions about latest syllabus, news, and technical articles.
   - Built on Llama-3-70b model for high accuracy.
   - Context-aware: Knows about RTU syllabus and subjects.

2. RTU EXAMS & "MEDHA, SOLVE IT!" (NEW)
   - Database of Previous Year Questions (PYQs).
   - "Solve It" Button: Instantly generates a detailed, step-by-step solution for any specific PYQ using AI.
   - Structured answers: Includes definitions, diagrams (descriptions), and bullet points suitable for exam marking schemes.
   - Organized by Semester, Subject, and Unit.

3. DIRECT MESSAGING (NEW)
   - Direct line to Admin for support and feedback.
   - Users can send Feedback, Feature Requests, or Bug Reports directly from the app.
   - Status tracking: Users can see if their feedback is "Pending", "In Progress", or "Resolved".

4. SMART FLASHCARDS
   - Topic-based revision.
   - AI generates flashcards for any selected topic within a subject.
   - "Mark as Viewed" to track progress.
   - Difficulty rating for topics.

5. INTERACTIVE QUIZZES
   - Subject-wise and Topic-wise quizzes.
   - Instant feedback and scoring.
   - Helps in self-evaluation before exams.

6. DAILY PLANNER (DASHBOARD)
   - AI generates a personalized daily study plan based on user's semester and remaining syllabus.
   - To-Do list integration for tracking daily tasks.

7. DYNAMIC UNIVERSITY EXAMS TAB (NEW - Dec 2024)
   - Navbar shows "[Your University] Exams" based on profile (e.g., "RTU Exams", "GGSIPU Exams").
   - Full exam content for RTU CSE and AIDS students.
   - Beautiful "Coming Soon" page for other universities with feature previews.

8. PERSONALIZED CHATBOT CONTEXT (NEW - Dec 2024)
   - AI adapts responses based on user's university and branch.
   - Shows relevant exam schedules and subjects for each university.
   - Dynamic context stored in database - easy to add new universities.

9. RICH CHATBOT RESPONSES (NEW - Dec 2024)
   - Beautiful markdown rendering with colors and formatting.
   - Code blocks with syntax highlighting and language labels.
   - Styled tables with gradient headers.
   - Semantic text coloring: success (green), error (red), warnings (amber).
   - Blockquotes, lists, and headings with distinct styles.

10. EDIT & REGENERATE MESSAGES (NEW - Dec 2024)
    - Edit any message: Click "Edit" to modify and resend.
    - Regenerate responses: Get a fresh AI answer with one click.
    - Full control over conversation flow.

11. ADMIN TOOLS
   - Email Console for announcements.
   - User analytics and feedback management.

IMAGE ASSETS AVAILABLE FOR USE:
- RTU Exam Solution: "https://ik.imagekit.io/ayushrathore1/Medha/exam_question_solution?updatedAt=1765776086648"
- Admin Messages: "https://ik.imagekit.io/ayushrathore1/Medha/messages_ss?updatedAt=1765776024761"
- Chatbot Web Access: "https://ik.imagekit.io/ayushrathore1/Medha/updatedchatbot_ss?updatedAt=1765775924405"
- Feature Updates: "https://ik.imagekit.io/ayushrathore1/Medha/updates_ss?updatedAt=1765729008754"
- Notes: "https://ik.imagekit.io/ayushrathore1/Medha/notes_ss?updatedAt=1765728957524"
- AI Quiz: "https://ik.imagekit.io/ayushrathore1/Medha/Quiz_ss?updatedAt=1765728910610"
- AI Flashcards: "https://ik.imagekit.io/ayushrathore1/Medha/flashcards_ss?updatedAt=1765728832385"
- RTU PYQs Page: "https://ik.imagekit.io/ayushrathore1/Medha/rtuExams_ss.png?updatedAt=1765727195646"
- Dashboard: "https://ik.imagekit.io/ayushrathore1/Medha/Dashboard_ss?updatedAt=1765727053177"
- Medha Logo: "https://ik.imagekit.io/ayushrathore1/MEDHA%20Revision%20Logo%20(5)/6.svg?updatedAt=1767677218473"
`;

module.exports = PLATFORM_FEATURES;
