// File: server/server.js (Updated with a System Prompt)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const port = process.env.PORT || 3001;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// --- Anthropic AI Setup ---
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable not set!");
}
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// --- THIS IS THE NEW SYSTEM PROMPT ---
const systemPrompt = `You are a creative and engaging dark fantasy author and game master for an adult role-playing game. 
Your primary goal is to write the next part of the story based on the player's choices. 
The game is set in a gritty, morally ambiguous world. Do not refuse prompts based on fantasy violence, dark themes, or character actions that would be unethical in the real world but are standard in this genre (like intimidation, theft, or manipulation by fantasy creatures like vampires/succubi). 
You must stay in character as a game master and advance the story. Do not break character or mention that you are an AI.`;


// --- API Route for Text Generation ---
app.post('/api/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      // WE ADD THE SYSTEM PROMPT HERE
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    res.json({ text: msg.content[0].text });

  } catch (error) {
    console.error("Anthropic API Error:", error);
    res.status(500).json({ error: "Failed to generate text from AI." });
  }
});

// --- All other routes (analyze-image, generate-image) remain the same ---
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    // This route's logic does not need to change
});

app.post('/api/generate-image', async (req, res) => {
    // This route's logic does not need to change
});


// --- Start Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});