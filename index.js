const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // ✅ Serve index.html from public/

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ List models (for debugging)
app.get("/models", async (req, res) => {
  try {
    const models = await genAI.listModels();
    console.log(models);
    res.json(models);
  } catch (err) {
    console.error("Error fetching models:", err);
    res.status(500).json({ error: "Failed to fetch models" });
  }
});

// ✅ Chat endpoint
app.post("/ask", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-pro"
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(prompt);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
