const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ✅ CORS settings (allow all for dev, restrict in production)
const corsOptions = {
  origin: "*", // ⚠️ Use your frontend URL here in production
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
};
app.use(cors(corsOptions));

// ✅ Parse incoming JSON requests
app.use(bodyParser.json());

// ✅ Serve static HTML from /public folder
app.use(express.static(path.join(__dirname, "public")));

// ✅ Preflight CORS request (required for fetch POST from browser)
app.options("/ask", cors(corsOptions));

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-pro";

// ✅ Chat endpoint
app.post("/ask", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const model = genAI.getGenerativeModel({ model: modelName });
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage(prompt);

    const reply = result.response?.text?.();
    if (!reply) {
      return res.status(500).json({ error: "Empty response from Gemini." });
    }

    res.json({ reply });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong." });
  }
});

// ✅ Default route for root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
