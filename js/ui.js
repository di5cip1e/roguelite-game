// js/ui.js
// Contains all functions that directly manipulate the DOM.

import { story, characterStats, gameState, userProfile, repgElements, ttsSystem, menuOpen } from './state.js';
// MAKE SURE THIS IMPORT IS CORRECT
import { generateImage } from './systems/ai.js';

export async function generateStoryImage(description) {
    try {
        document.getElementById('loadingIndicator').hidden = false;
        // This line uses the imported generateImage function
        let imageUrl = await generateImage(description);
        let storyImage = document.getElementById('storyImage');
        storyImage.src = imageUrl;
        storyImage.hidden = false;
    } catch (error) {
        console.error("Failed to generate story image:", error);
    } finally {
        document.getElementById('loadingIndicator').hidden = true;
    }
}

// ... the rest of your ui.js file ...