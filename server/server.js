// This file runs on the Render server.
require('dotenv').config(); // Loads variables from .env file for local testing
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
// Render provides the PORT environment variable.
const port = process.env.PORT || 3001; 

// --- Middleware ---
// Use CORS to allow requests from your frontend.
app.use(cors()); 
// Use express.json() to parse the body of POST requests.
app.use(express.json());

// --- AI Setup ---
// The API key is securely accessed from an environment variable.
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable not set!");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- API Route ---
app.post('/api/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ text: text });

  } catch (error) {
    console.error("AI API Error:", error);
    res.status(500).json({ error: "Failed to generate text from AI." });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});