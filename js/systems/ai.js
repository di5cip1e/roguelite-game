// js/systems/ai.js
// This module handles communication with the backend AI service.

import { story, appendStory } from '../state.js';
import { updateStory, generateStoryImage } from '../ui.js';
import { generateChoices } from './game-loop.js';

/**
 * Calls your secure Render Web Service to generate text.
 * @param {string} prompt The prompt to send to the AI.
 * @returns {Promise<string>} A promise that resolves with the generated text.
 */
export async function generateText(prompt) {
    console.log("--- Sending Prompt to Render Web Service ---", prompt);

    // IMPORTANT: Replace this with your actual Render Web Service URL.
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
        // Return a fallback message so the game doesn't break
        return "The ethereal connection wavers, and the path forward becomes unclear...";
    }
}


/**
 * Simulates calling an image generation AI. In a real app, this would also call a backend service.
 * @param {string} description The description of the image to generate.
 * @returns {Promise<string>} A promise that resolves with a URL to the generated image.
 */
export async function generateImage(description) {
    console.log("--- Generating Image ---", description);
    // This uses a placeholder service. In a real app, this would be a backend call like generateText.
    const encodedDescription = encodeURIComponent(description.substring(0, 50)); // Keep URL reasonable
    return `https://placehold.co/600x400/221C16/C7A758?text=${encodedDescription}`;
}


// --- UI-Facing Functions that use the AI ---

export async function generateTextFromImage() {
    try {
        const fileInput = document.getElementById('imageToTextInput');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select an image file first');
            return;
        }
        document.getElementById('loadingIndicator').hidden = false;

        // In a real app, you'd upload the file and send it to a vision model.
        // We'll simulate by generating a description of a generic "uploaded image".
        const description = await generateText(`Describe a mysterious object or scene that the player has found and is now examining. Be descriptive and intriguing.`);
        
        appendStory(`\n\nYou examine the image carefully...\n\n${description}`);
        updateStory();
        generateChoices();

    } catch (error) {
        console.error("Error processing image:", error);
        appendStory("\n\nYou tried to examine the image, but couldn't make sense of it.");
        updateStory();
    } finally {
        document.getElementById('loadingIndicator').hidden = true;
    }
}


export async function generateImageFromText() {
    try {
        const textInput = document.getElementById('textToImageInput');
        const description = textInput.value.trim();
        if (!description) {
            alert('Please enter a description first');
            textInput.focus();
            return;
        }

        // This function calls the UI function directly
        await generateStoryImage(description);

        appendStory(`\n\nYou focus your thoughts, picturing the scene: ${description}\n\nA vivid image forms in your mind.`);
        updateStory();
        textInput.value = '';

    } catch (error) {
        console.error("Error generating image from text:", error);
        appendStory("\n\nYou tried to visualize the scene, but your imagination failed you.");
        updateStory();
    }
}