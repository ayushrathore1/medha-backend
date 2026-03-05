/**
 * Seed Approved YouTube Channels
 * Run: node scripts/seedChannels.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const ApprovedChannel = require("../models/ApprovedChannel");

const CHANNELS = [
  // CS/DSA/Programming Fundamentals
  { channelId: "UCJskGeByzRRSvmOyZtNYsog", channelName: "Abdul Bari", channelUrl: "https://youtube.com/@abdul_bari", subjectTags: ["DSA", "Algorithms", "Theory of Computation", "Compiler Design"], priority: 9 },
  { channelId: "UCo8bcnLyZH8tBIH9V1mLgqQ", channelName: "Neso Academy", channelUrl: "https://youtube.com/@nesoacademy", subjectTags: ["Digital Electronics", "Computer Networks", "Computer Organization", "OS", "Signals Systems", "Electronics", "Digital Circuits", "Microprocessors"], priority: 9 },
  { channelId: "UCVwWF0MheVCxCN-8oBDEMtA", channelName: "Gate Smashers", channelUrl: "https://youtube.com/@GateSmashers", subjectTags: ["DBMS", "OS", "CN", "DSA", "TOC", "Compiler Design", "CD"], priority: 10 },
  { channelId: "UCe_G2V-YuNxUkBN4cqEsBag", channelName: "Jenny Lectures CS IT", channelUrl: "https://youtube.com/@JennyslecturesCSITNEW", subjectTags: ["DSA", "C++", "Data Structures", "Algorithms"], priority: 8 },
  { channelId: "UCZCFT0ZxaLV8BDkfDrCKCqQ", channelName: "Anuj Bhaiya", channelUrl: "https://youtube.com/@AnujBhaiya", subjectTags: ["DBMS", "OS", "Web Dev", "Java"], priority: 8 },
  { channelId: "UCBwmMxybNva6P_5VmxjzwqA", channelName: "CodeWithHarry", channelUrl: "https://youtube.com/@CodeWithHarry", subjectTags: ["Python", "Web Dev", "C", "Programming Fundamentals"], priority: 7 },
  { channelId: "UCVLbzhxVTiTLiVKeGV7WEBg", channelName: "Apna College", channelUrl: "https://youtube.com/@ApnaCollegeOfficial", subjectTags: ["DSA", "Java", "SQL", "Web Dev"], priority: 8 },
  { channelId: "UCJihxo56p1XxlXBQPfbcBLQ", channelName: "Knowledge Gate", channelUrl: "https://youtube.com/@KnowledgeGATE", subjectTags: ["DBMS", "OS", "CN", "TOC"], priority: 9 },
  { channelId: "UCVKh7rjAkMNGVm77ZEuJCLQ", channelName: "Last Moment Tuitions", channelUrl: "https://youtube.com/@LastMomentTuitions", subjectTags: ["ALL"], priority: 10, notes: "LMT covers almost all CS subjects" },
  { channelId: "UC0RhatS1pyxInC00YKjjBqQ", channelName: "Gaurav Sen", channelUrl: "https://youtube.com/@gkcs", subjectTags: ["System Design", "DBMS", "Distributed Systems"], priority: 8 },
  { channelId: "UCM-yUTYGmrNvKOCcAl21g3A", channelName: "Kunal Kushwaha", channelUrl: "https://youtube.com/@KunalKushwaha", subjectTags: ["DSA", "Java", "Git", "Linux"], priority: 7 },
  { channelId: "UCqmugCqELzhIMNYnsjScXXw", channelName: "Striver", channelUrl: "https://youtube.com/@takeUforward", subjectTags: ["DSA", "Competitive Programming", "System Design"], priority: 9 },

  // Math
  { channelId: "UCRGXV1QlxZ8aucmE45tQgmQ", channelName: "Professor Leonard", channelUrl: "https://youtube.com/@ProfessorLeonard", subjectTags: ["Engineering Mathematics", "Calculus", "Linear Algebra"], priority: 8 },
  { channelId: "UC9-y-6csu5WGm29I7JiwpnA", channelName: "Computerphile", channelUrl: "https://youtube.com/@Computerphile", subjectTags: ["Computer Networks", "Security", "Algorithms", "Cryptography"], priority: 7 },

  // ECE
  { channelId: "UCiDKcjKocimAO1tVw0qCjow", channelName: "ALL About Electronics", channelUrl: "https://youtube.com/@ALL_About_Electronics", subjectTags: ["Analog Electronics", "Digital Electronics", "Control Systems"], priority: 8 },

  // Additional curated channels
  { channelId: "UCONPe-zI46GKq8dNHLeFs8g", channelName: "Science with Avni", channelUrl: "https://youtube.com/@ScienceWithAvni", subjectTags: ["Physics", "Engineering Mathematics", "Chemistry", "Science"], priority: 8 },
  { channelId: "UCNQ6FEtztATuaVhZKCY28Yw", channelName: "Chai aur Code", channelUrl: "https://youtube.com/@chaborcode", subjectTags: ["Web Dev", "JavaScript", "React", "Node.js", "Python", "Backend"], priority: 8 },
  { channelId: "UCuJtT_b4VwmEqLNgbre1nEQ", channelName: "5 Minute Engineering", channelUrl: "https://youtube.com/@5MinuteEngineering", subjectTags: ["ALL"], priority: 9, notes: "Quick concept videos across all engineering subjects" },
  { channelId: "UCa7vbFGaaOB20FIYqPBWt-g", channelName: "Gajendra Purohit", channelUrl: "https://youtube.com/@GajendraPurohit", subjectTags: ["Engineering Mathematics", "Calculus", "Linear Algebra", "Differential Equations", "Probability"], priority: 9 },
  { channelId: "UCYHOdG_XqQ-T-P4SrCqY3_Q", channelName: "Pradeep Giri Academy", channelUrl: "https://youtube.com/@PradeepGiriAcademy", subjectTags: ["DBMS", "OS", "CN", "DSA", "TOC", "Compiler Design"], priority: 9 },
];

async function seed() {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medha";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    let created = 0;
    let updated = 0;

    for (const ch of CHANNELS) {
      const result = await ApprovedChannel.updateOne(
        { channelId: ch.channelId },
        { $set: ch },
        { upsert: true }
      );
      if (result.upsertedCount > 0) created++;
      else if (result.modifiedCount > 0) updated++;
    }

    console.log(`✅ Seeded channels: ${created} created, ${updated} updated (${CHANNELS.length} total)`);
    const count = await ApprovedChannel.countDocuments();
    console.log(`📊 Total channels in DB: ${count}`);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
