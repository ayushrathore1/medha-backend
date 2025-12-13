const Subject = require("../models/Subject");
const Topic = require("../models/Topic");

const RTU_SUBJECT_NAME = "RTU - 3rd Semester";
const RTU_DEFAULT_TOPICS = [
  "Advanced Engineering Mathematics",
  "Managerial Economics and Financial Accounting",
  "Digital Electronics",
  "Data Structure and Algorithms",
  "Object Oriented Programming",
  "Software Engineering",
];

exports.getRTU3rdSemTopics = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find or Create the Subject
    let subject = await Subject.findOne({
      name: RTU_SUBJECT_NAME,
      user: userId,
    });

    if (!subject) {
      subject = await Subject.create({
        name: RTU_SUBJECT_NAME,
        user: userId,
      });
    }

    // 2. Find ALL existing topics for this user matching our target names
    // (We match by name because name+owner is unique)
    const existingTopics = await Topic.find({
      name: { $in: RTU_DEFAULT_TOPICS },
      owner: userId,
    });

    // 3. Identify which of the default topics are missing entirely
    const existingTopicNames = existingTopics.map((t) => t.name);
    const missingTopicNames = RTU_DEFAULT_TOPICS.filter(
      (name) => !existingTopicNames.includes(name)
    );

    // 4. Create missing topics
    if (missingTopicNames.length > 0) {
      const newTopics = missingTopicNames.map((name) => ({
        name,
        subject: RTU_SUBJECT_NAME,
        owner: userId,
        difficulty: "medium", // Default to medium as per Topic schema default
      }));
      await Topic.insertMany(newTopics);
    }

    // 5. Fetch the complete list again to ensure we have everything including new ones
    // We fetch where name is in our list
    const allTopics = await Topic.find({
      name: { $in: RTU_DEFAULT_TOPICS },
      owner: userId,
    });

    // 6. Sort them to match the default order (optional but nice)
    const sortedTopics = RTU_DEFAULT_TOPICS.map(name => 
        allTopics.find(t => t.name === name)
    ).filter(Boolean); // Filter just in case

    // 7. Format response
    const formattedTopics = sortedTopics.map((topic) => ({
      _id: topic._id,
      name: topic.name,
      difficulty: topic.difficulty,
      viewed: 0, 
      total: 0,
      subject: topic.subject // Include subject name if useful
    }));

    res.json({
      subject: subject,
      topics: formattedTopics,
    });
  } catch (error) {
    console.error("Error in getRTU3rdSemTopics:", error);
    res.status(500).json({ message: "Server error fetching RTU data" });
  }
};
