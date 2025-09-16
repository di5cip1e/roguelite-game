// File: server/server.js (Updated for Anthropic Claude 3 Haiku)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
// 1. Import the new Anthropic SDK
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 2. Set up the Anthropic client with your new API key
//    NOTE: We'll use a new environment variable name for clarity
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable not set!");
}
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// --- API Route ---
app.post('/api/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // 3. Make the API call to Anthropic
    const msg = await anthropic.messages.create({
      // THIS IS WHERE YOU SPECIFY THE MODEL
      model: "claude-3-haiku-20240307",
      max_tokens: 1024, // The maximum number of tokens to generate
      messages: [{ role: "user", content: prompt }],
    });

    // 4. Get the text from the response
    const generatedText = msg.content[0].text;

    res.json({ text: generatedText });

  } catch (error) {
    console.error("Anthropic API Error:", error);
    res.status(500).json({ error: "Failed to generate text from AI." });
  }
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});