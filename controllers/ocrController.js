const Note = require("../models/Note");
const axios = require("axios");

// Extract text from a note's file using OCR.Space and update the note content
exports.extractText = async (req, res) => {
  try {
    const { noteId } = req.body;
    if (!noteId) {
      return res.status(400).json({ message: "noteId is required." });
    }

    // Only find notes for the current user (security best practice!)
    // Make sure you use owner: req.user.id if your schema uses 'owner'
    const note = await Note.findOne({ _id: noteId, owner: req.user.id });
    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    // Real OCR.Space cloud API call
    const ocrResponse = await axios.post(
      "https://api.ocr.space/parse/imageurl",
      null,
      {
        params: {
          apikey: process.env.OCRSPACE_API_KEY,
          url: note.fileUrl,
          isOverlayRequired: false,
          language: "eng",
        },
      }
    );

    const parsedResults = ocrResponse.data.ParsedResults;
    const extractedText = (parsedResults && parsedResults[0]?.ParsedText) || "";

    note.extractedText = extractedText;
    note.content = extractedText;
    await note.save();

    res.json({ message: "Text extracted successfully.", extractedText, note });
  } catch (err) {
    console.error("OCR Extraction Error:", err.message || err);
    res.status(500).json({ message: "Failed to extract text from image/PDF." });
  }
};
