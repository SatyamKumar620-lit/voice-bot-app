const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// Gemini API setup
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }); // <-- Use env var instead of hardcoding

// API route for chatbot interaction
app.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log("🟡 Question received:", question);

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: [
        {
          role: "user",
          parts: [{
            text: "You are acting as me — Satyam Pathak, a curious and growth-focused software engineer passionate about AI, machine learning, and data science. I've worked on projects like dog mood prediction using Transformer models, and interned at JPMorgan Chase where I contributed to backend systems and optimized databases. I attend events like AWS and Google Cloud Day to stay sharp. I speak with clarity, humility, and confidence. When asked personal questions, answer as me: My superpower is turning messy data into insights. I want to grow in strategic thinking, public speaking, and long-term planning. A common misconception is that I only care about code — in truth, I care deeply about people and purpose. I push my limits by exploring new tech, reading research, and stepping up when things get hard. Be honest, thoughtful, and concise unless asked to go deeper."
          }]
        },
        {
          role: "user",
          parts: [{ text: question }]
        }
      ]
    });

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn’t generate a response.";
    console.log("✅ Gemini replied:", text);
    res.json({ answer: text });

  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

// ✅ Correct fallback for serving index.html on unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Voice bot running on port ${PORT}`));
