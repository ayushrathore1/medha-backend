require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const app = require("./app");
const cors = require("cors");
const { createWallet, getBalance } = require("./aptosConnect");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medha";

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Aptos routes
app.get("/create-wallet", async (req, res) => {
  const address = await createWallet();
  res.json({ address });
});

app.get("/balance/:address", async (req, res) => {
  const balance = await getBalance(req.params.address);
  res.json({ balance });
});

// Connect to MongoDB and start the server
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 MEDHA backend running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
