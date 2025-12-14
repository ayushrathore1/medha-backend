/**
 * Web Search Utility using SERP API
 * Provides real-time web search results for the chatbot
 */

const axios = require("axios");

const SERP_API_KEY = process.env.SERP_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SERP_API_URL = "https://serpapi.com/search.json";

/**
 * Uses AI to determine if a query needs web search
 * @param {string} query - User's question
 * @returns {Promise<boolean>} Whether web search should be performed
 */
async function needsWebSearch(query) {
  // If SERP API key is not configured, never search
  if (!SERP_API_KEY || !GROQ_API_KEY) {
    return false;
  }
  
  try {
    const decisionPrompt = `You are a query classifier. Analyze the following user query and decide if it requires REAL-TIME web search to answer accurately.

ANSWER "YES" if the query:
- Asks about current events, news, or recent happenings
- Needs up-to-date prices, stock values, or statistics
- Asks about something that happened in 2024 or later
- Requires the latest information (schedules, dates, results)
- Is about trending topics, current rankings, or live data
- Cannot be answered accurately with knowledge from 2023 or earlier

ANSWER "NO" if the query:
- Is about static educational concepts (math, science, programming)
- Asks for definitions, explanations, or how things work
- Is about historical facts or established knowledge
- Asks for code help, debugging, or programming concepts
- Is related to syllabus, study material, or academic topics
- Can be answered accurately with general knowledge

User Query: "${query}"

Respond with ONLY "YES" or "NO" - nothing else.`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant", // Fast, cheap model for classification
        messages: [{ role: "user", content: decisionPrompt }],
        max_tokens: 5,
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    const decision = response.data.choices[0]?.message?.content?.trim().toUpperCase();
    console.log(`🤔 AI web search decision for "${query.substring(0, 50)}...": ${decision}`);
    
    return decision === "YES";
    
  } catch (error) {
    console.error("Error in AI search decision:", error.message);
    // Fall back to not searching on error
    return false;
  }
}

/**
 * Performs web search using SERP API
 * @param {string} query - Search query
 * @param {number} numResults - Number of results to fetch (default 5)
 * @returns {Object} Search results or null on error
 */
async function performWebSearch(query, numResults = 5) {
  if (!SERP_API_KEY) {
    console.log("⚠️ SERP API key not configured, skipping web search");
    return null;
  }
  
  try {
    console.log(`🔍 Performing web search for: "${query}"`);
    
    const response = await axios.get(SERP_API_URL, {
      params: {
        api_key: SERP_API_KEY,
        q: query,
        engine: "google",
        num: numResults,
        hl: "en",
        gl: "in", // India for RTU students
      },
      timeout: 10000,
    });
    
    const results = {
      searchQuery: query,
      organicResults: [],
      answerBox: null,
      knowledgeGraph: null,
    };
    
    // Extract organic results
    if (response.data.organic_results) {
      results.organicResults = response.data.organic_results.slice(0, numResults).map(r => ({
        title: r.title,
        link: r.link,
        snippet: r.snippet,
      }));
    }
    
    // Extract answer box if present
    if (response.data.answer_box) {
      results.answerBox = {
        title: response.data.answer_box.title,
        answer: response.data.answer_box.answer || response.data.answer_box.snippet,
      };
    }
    
    // Extract knowledge graph if present
    if (response.data.knowledge_graph) {
      results.knowledgeGraph = {
        title: response.data.knowledge_graph.title,
        description: response.data.knowledge_graph.description,
        type: response.data.knowledge_graph.type,
      };
    }
    
    console.log(`✅ Web search returned ${results.organicResults.length} results`);
    return results;
    
  } catch (error) {
    console.error("❌ Web search error:", error.message);
    return null;
  }
}

/**
 * Formats search results into a context string for the AI
 * @param {Object} results - Search results object
 * @returns {string} Formatted context string
 */
function formatSearchContext(results) {
  if (!results) return "";
  
  let context = "\n[REAL-TIME WEB SEARCH RESULTS]\n";
  
  // Add answer box if present
  if (results.answerBox) {
    context += `Direct Answer: ${results.answerBox.answer || results.answerBox.title}\n\n`;
  }
  
  // Add knowledge graph if present
  if (results.knowledgeGraph) {
    context += `${results.knowledgeGraph.title}: ${results.knowledgeGraph.description || ""}\n\n`;
  }
  
  // Add organic results
  if (results.organicResults.length > 0) {
    context += "Top Search Results:\n";
    results.organicResults.forEach((r, i) => {
      context += `${i + 1}. ${r.title}\n   ${r.snippet}\n   Source: ${r.link}\n\n`;
    });
  }
  
  context += "[END OF WEB SEARCH RESULTS]\n";
  context += "Use the above web search results to provide an accurate, up-to-date answer. Cite sources when appropriate.\n";
  
  return context;
}

module.exports = {
  needsWebSearch,
  performWebSearch,
  formatSearchContext,
};
