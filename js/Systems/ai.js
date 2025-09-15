// js/systems/ai.js
// Contains the placeholder functions for interacting with generative AI models.

import { story } from '../state.js';
import { updateStory, generateStoryImage } from '../ui.js';
import { generateChoices } from './game-loop.js';

// --- Core AI Placeholder Functions ---

/**
 * Simulates calling a text generation AI.
 * In a real application, this function would use fetch() to call your backend,
 * which would then securely call the AI API (e.g., Gemini).
 * @param {string} prompt The prompt to send to the AI.
 * @returns {Promise<string>} A promise that resolves with the generated text.
 */
// js/systems/ai.js

export async function generateText(prompt) {
    console.log("--- Sending Prompt to Render Web Service ---");

    // IMPORTANT: Replace this with your actual Render Web Service URL.
    // You will get this URL after you deploy the backend in the next step.
    const serviceUrl = "https://roguelite-game-serv.onrender.com/api/generate-text";

    try {
        const response = await fetch(serviceUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: prompt }),
        });

        if (!response.ok) {
            throw new Error(`Render service failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.text;

    } catch (error) {
        console.error("Error calling Render service:", error);
        return "The connection to the arcane dimensions has failed...";
    }
}

// ... the rest of the file (generateImage, etc.) remains the same


export async function generateImageFromText() {
    try {
        const textInput = document.getElementById('textToImageInput');
        const description = textInput.value.trim();

        if (!description) {
            alert('Please enter a description first');
            textInput.focus();
            return;
        }

        const imageUrl = await generateImage(description);

        const storyImage = document.getElementById('storyImage');
        storyImage.src = imageUrl;
        storyImage.hidden = false;

        story += `\n\nYou imagine: ${description}\n\nA vivid image forms in your mind.`;
        updateStory();
        textInput.value = '';

    } catch (error) {
        console.error("Error generating image from text:", error);
        story += "\n\nYou tried to visualize the scene, but your imagination failed you.";
        updateStory();
    }
}