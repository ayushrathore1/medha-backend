const axios = require("axios");
const Groq = require("groq-sdk");
const ApprovedChannel = require("../models/ApprovedChannel");
const Syllabus = require("../models/Syllabus");

// ─── API Keys ───────────────────────────────────────────────
const YOUTUBE_DATA_API_KEY = process.env.YOUTUBE_DATA_API_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const groq = GROQ_API_KEY ? new Groq({ apiKey: GROQ_API_KEY }) : null;

// ─── In-Memory Cache (6 hour TTL) ──────────────────────────
const cache = new Map();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

function getCacheKey(query, subject, unit) {
  return `${query}__${subject || ""}__${unit || ""}`.toLowerCase().trim();
}

function checkCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
  // Clean old entries if cache grows too large
  if (cache.size > 200) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.timestamp > CACHE_TTL) cache.delete(k);
    }
  }
}

// ─── Trending Topics ────────────────────────────────────────
const TRENDING_TOPICS = [
  "Data Structures & Algorithms",
  "Machine Learning Basics",
  "Web Development with React",
  "Python for Beginners",
  "System Design",
  "Database Management (DBMS)",
  "Operating Systems",
  "Computer Networks",
  "Object Oriented Programming",
  "Dynamic Programming",
  "Engineering Mathematics",
  "Digital Electronics",
];

// ─── Get channels from DB by subject ────────────────────────
async function getApprovedChannels(subject) {
  const query = { isActive: true };
  if (subject) {
    query.$or = [
      { subjectTags: { $regex: new RegExp(subject, "i") } },
      { subjectTags: "ALL" },
    ];
  }
  const channels = await ApprovedChannel.find(query)
    .sort({ priority: -1 })
    .limit(12)
    .lean();
  return channels;
}

// ─── YouTube Data API v3 — search by channel ────────────────
async function searchYouTubeByChannels(query, channels) {
  if (!YOUTUBE_DATA_API_KEY) {
    console.warn("[Lectures] YouTube Data API key not configured");
    return [];
  }

  // Search top 6 channels, 3 results each (costs 6 × 100 = 600 quota units)
  const topChannels = channels.slice(0, 6);
  const searchPromises = topChannels.map((ch) =>
    axios
      .get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: YOUTUBE_DATA_API_KEY,
          q: query,
          channelId: ch.channelId,
          type: "video",
          part: "snippet",
          maxResults: 3,
          order: "relevance",
          relevanceLanguage: "en",
          safeSearch: "strict",
        },
        timeout: 8000,
      })
      .then((res) =>
        (res.data.items || []).map((item) => ({
          videoId: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          channelName: ch.channelName,
          description: item.snippet.description || "",
          thumbnail:
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url,
          publishedAt: item.snippet.publishedAt,
          isTrustedChannel: true,
          channelPriority: ch.priority,
        }))
      )
      .catch((err) => {
        console.warn(`[Lectures] Channel search failed for ${ch.channelName}:`, err.message);
        return [];
      })
  );

  // Also do a generic search for broader results
  searchPromises.push(
    axios
      .get("https://www.googleapis.com/youtube/v3/search", {
        params: {
          key: YOUTUBE_DATA_API_KEY,
          q: `${query} lecture tutorial`,
          type: "video",
          part: "snippet",
          maxResults: 5,
          order: "relevance",
          relevanceLanguage: "en",
          videoDuration: "medium",
          safeSearch: "strict",
        },
        timeout: 8000,
      })
      .then((res) =>
        (res.data.items || []).map((item) => {
          const channelMatch = channels.find(
            (ch) => ch.channelName.toLowerCase() === item.snippet.channelTitle?.toLowerCase()
          );
          return {
            videoId: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            channelName: item.snippet.channelTitle,
            description: item.snippet.description || "",
            thumbnail:
              item.snippet.thumbnails?.high?.url ||
              item.snippet.thumbnails?.medium?.url ||
              item.snippet.thumbnails?.default?.url,
            publishedAt: item.snippet.publishedAt,
            isTrustedChannel: !!channelMatch,
            channelPriority: channelMatch?.priority || 0,
          };
        })
      )
      .catch(() => [])
  );

  const results = await Promise.all(searchPromises);
  const merged = results.flat();

  // Deduplicate by videoId
  const seen = new Set();
  return merged.filter((v) => {
    if (!v.videoId || seen.has(v.videoId)) return false;
    seen.add(v.videoId);
    return true;
  });
}

// ─── YouTube Video Details (stats + duration) ───────────────
async function getVideoDetails(videoIds) {
  if (!YOUTUBE_DATA_API_KEY || videoIds.length === 0) return [];

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          key: YOUTUBE_DATA_API_KEY,
          id: videoIds.join(","),
          part: "snippet,statistics,contentDetails",
        },
        timeout: 10000,
      }
    );

    return response.data.items.map((item) => {
      const stats = item.statistics || {};
      const snippet = item.snippet || {};
      const duration = parseDuration(item.contentDetails?.duration || "");

      return {
        videoId: item.id,
        title: snippet.title,
        description: snippet.description?.substring(0, 500) || "",
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        thumbnail:
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url,
        viewCount: parseInt(stats.viewCount || "0"),
        likeCount: parseInt(stats.likeCount || "0"),
        commentCount: parseInt(stats.commentCount || "0"),
        duration,
        tags: snippet.tags?.slice(0, 10) || [],
      };
    });
  } catch (error) {
    console.error("[Lectures] YouTube details error:", error.message);
    return [];
  }
}

function parseDuration(durationStr) {
  if (!durationStr) return "Unknown";
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "Unknown";
  const hours = match[1] ? `${match[1]}h ` : "";
  const minutes = match[2] ? `${match[2]}m ` : "";
  const seconds = match[3] ? `${match[3]}s` : "";
  return (hours + minutes + seconds).trim() || "0s";
}

// ─── GFG Search via SerpAPI ─────────────────────────────────
async function searchGfg(query) {
  if (!SERP_API_KEY) {
    console.warn("[Lectures] SerpAPI key not configured");
    return [];
  }

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        api_key: SERP_API_KEY,
        q: `site:geeksforgeeks.org ${query} tutorial`,
        engine: "google",
        num: 5,
      },
      timeout: 10000,
    });

    const results = response.data.organic_results || [];
    return results.map((item) => ({
      title: (item.title || "").replace(/ - GeeksforGeeks/gi, "").trim(),
      link: item.link || "",
      snippet: item.snippet || "",
      thumbnail: item.thumbnail || null,
      source: "gfg",
    }));
  } catch (error) {
    console.error("[Lectures] GFG search error:", error.message);
    return [];
  }
}

// ─── Get syllabus context for AI scoring ────────────────────
async function getSyllabusContext(subjectName) {
  if (!subjectName) return null;

  try {
    const syllabus = await Syllabus.findOne({
      subjectName: { $regex: new RegExp(subjectName, "i") },
    }).lean();
    return syllabus;
  } catch {
    return null;
  }
}

// ─── Groq AI Scoring Against Syllabus ───────────────────────
async function scoreWithAI(query, youtubeResults, gfgResults, syllabusContext) {
  if (!groq) {
    // Fallback: basic scoring without AI
    return {
      youtube: youtubeResults.map((v, i) => ({
        ...v,
        aiScore: Math.max(30, 90 - i * 8),
        matchedTopics: [],
        explanation: "AI scoring unavailable",
        recommended: i < 3,
        bestFor: "Educational content",
      })),
      gfg: gfgResults.map((a, i) => ({
        ...a,
        aiScore: Math.max(40, 85 - i * 10),
        matchedTopics: [],
        explanation: "AI scoring unavailable",
        recommended: i < 2,
        bestFor: "Reference article",
      })),
      topPick: "YT_0",
      studyTip: "Start with the top-rated video, then use articles for revision.",
    };
  }

  // Build syllabus text
  let syllabusText = "No specific syllabus available.";
  if (syllabusContext && syllabusContext.units) {
    syllabusText = syllabusContext.units
      .map(
        (unit) =>
          `Unit ${unit.unitNumber}: ${unit.title}\nTopics: ${unit.topics.join(", ")}`
      )
      .join("\n\n");
  }

  const ytList = youtubeResults
    .map(
      (v, i) =>
        `YT_${i}: "${v.title}" by ${v.channelTitle} (${(v.viewCount || 0).toLocaleString()} views, ${v.duration})`
    )
    .join("\n");

  const gfgList = gfgResults
    .map((a, i) => `GFG_${i}: "${a.title}" - ${a.snippet}`)
    .join("\n");

  const prompt = `You are an academic content evaluator for engineering students.

STUDENT SEARCHED FOR: "${query}"

SYLLABUS CONTEXT:
${syllabusText}

YOUTUBE RESULTS:
${ytList || "None"}

GFG ARTICLES:
${gfgList || "None"}

For each result assign a relevance score 0-100, identify matched syllabus topics, write a 1-sentence explanation, and mark if recommended. Also pick the overall topPick and provide a studyTip.

Scoring guide:
  90-100: Exact topic match
  70-89: Covers topic well
  50-69: Partially relevant
  30-49: Loosely related
  0-29: Not relevant

RESPOND IN THIS EXACT JSON FORMAT:
{
  "youtube": [
    { "id": "YT_0", "score": 92, "matchedTopics": ["topic1"], "explanation": "...", "recommended": true, "bestFor": "..." }
  ],
  "gfg": [
    { "id": "GFG_0", "score": 88, "matchedTopics": ["topic1"], "explanation": "...", "recommended": true, "bestFor": "..." }
  ],
  "topPick": "YT_0",
  "studyTip": "..."
}`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are an academic content evaluator. Always respond in valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0].message.content;
    const parsed = JSON.parse(text);

    // Merge AI scores into results
    const scoredYT = youtubeResults.map((v, i) => {
      const ai = (parsed.youtube || []).find((a) => a.id === `YT_${i}`) || {};
      return {
        ...v,
        aiScore: ai.score || 50,
        matchedTopics: ai.matchedTopics || [],
        explanation: ai.explanation || "",
        recommended: ai.recommended || false,
        bestFor: ai.bestFor || "",
      };
    });

    const scoredGfg = gfgResults.map((a, i) => {
      const ai = (parsed.gfg || []).find((g) => g.id === `GFG_${i}`) || {};
      return {
        ...a,
        aiScore: ai.score || 50,
        matchedTopics: ai.matchedTopics || [],
        explanation: ai.explanation || "",
        recommended: ai.recommended || false,
        bestFor: ai.bestFor || "",
      };
    });

    return {
      youtube: scoredYT,
      gfg: scoredGfg,
      topPick: parsed.topPick || "YT_0",
      studyTip:
        parsed.studyTip ||
        "Start with the highest scored video, then use articles for revision.",
    };
  } catch (error) {
    console.error("[Lectures] AI scoring error:", error.message);
    // Fallback scoring
    return {
      youtube: youtubeResults.map((v, i) => ({
        ...v,
        aiScore: Math.max(30, 90 - i * 8),
        matchedTopics: [],
        explanation: "AI scoring failed",
        recommended: i < 3,
        bestFor: "Educational content",
      })),
      gfg: gfgResults.map((a, i) => ({
        ...a,
        aiScore: Math.max(40, 85 - i * 10),
        matchedTopics: [],
        explanation: "AI scoring failed",
        recommended: i < 2,
        bestFor: "Reference article",
      })),
      topPick: "YT_0",
      studyTip: "Start with the top-rated video.",
    };
  }
}

// ─── Main Orchestrator ──────────────────────────────────────
async function getRecommendations(topic, subject, unit) {
  console.log(
    `[Lectures] Searching: "${topic}" | subject: "${subject || "any"}" | unit: "${unit || "any"}"`
  );

  // Check cache
  const cacheKey = getCacheKey(topic, subject, unit);
  const cached = checkCache(cacheKey);
  if (cached) {
    console.log("[Lectures] Cache hit!");
    return cached;
  }

  // 1. Get approved channels from DB
  const channels = await getApprovedChannels(subject);
  console.log(`[Lectures] Using ${channels.length} approved channels`);

  // 2. Search YouTube by channels + GFG in parallel
  const [rawYoutube, gfgResults] = await Promise.all([
    searchYouTubeByChannels(topic, channels),
    searchGfg(topic),
  ]);

  console.log(
    `[Lectures] Found ${rawYoutube.length} YouTube, ${gfgResults.length} GFG results`
  );

  // 3. Fetch video details (stats, duration)
  const videoIds = rawYoutube.map((r) => r.videoId).filter(Boolean);
  let videoDetails = [];
  if (videoIds.length > 0) {
    const details = await getVideoDetails(videoIds);
    // Merge details with channel info from search
    videoDetails = details.map((d) => {
      const search = rawYoutube.find((r) => r.videoId === d.videoId) || {};
      return {
        ...d,
        channelName: search.channelName || d.channelTitle,
        isTrustedChannel: search.isTrustedChannel || false,
        channelPriority: search.channelPriority || 0,
      };
    });
  }

  // 4. Get syllabus context
  const syllabusContext = await getSyllabusContext(subject);

  // 5. AI Score everything against syllabus
  const scored = await scoreWithAI(topic, videoDetails, gfgResults, syllabusContext);

  // 6. Sort YouTube by: AI score + trusted channel bonus
  scored.youtube.sort((a, b) => {
    const scoreA = a.aiScore + (a.isTrustedChannel ? 5 : 0);
    const scoreB = b.aiScore + (b.isTrustedChannel ? 5 : 0);
    return scoreB - scoreA;
  });

  const result = {
    topic,
    subject: subject || null,
    unit: unit || null,
    youtube: scored.youtube,
    gfg: scored.gfg,
    topPick: scored.topPick,
    studyTip: scored.studyTip,
    channelsUsed: channels.map((c) => c.channelName),
    totalResults: scored.youtube.length + scored.gfg.length,
    searchedAt: new Date().toISOString(),
  };

  // Cache result
  setCache(cacheKey, result);

  return result;
}

module.exports = {
  getRecommendations,
  TRENDING_TOPICS,
  getApprovedChannels,
  getSyllabusContext,
};
