const express = require("express");
const router = express.Router();
const { createWorker } = require("tesseract.js");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const path = require("path");
const fs = require("fs");

// @route    POST /api/ocr
// @desc     Upload an image and get extracted text with OCR
// @access   Private
router.post("/", auth, upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }

  const imagePath = path.join(__dirname, "..", req.file.path);
  const worker = await createWorker("eng"); // You can add Hindi or other languages too

  try {
    const {
      data: { text },
    } = await worker.recognize(imagePath);
    await worker.terminate();

    // Optionally, delete the uploaded image to save space (uncomment if needed)
    // fs.unlinkSync(imagePath);

    res.json({ text });
  } catch (err) {
    await worker.terminate();
    next(err);
  }
});

module.exports = router;
