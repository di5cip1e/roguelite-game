// js/systems/game-loop.js
import { story, choices, userProfile, playerChoices } from '../state.js';
import { difficultySettings } from '../data.js';
import { updateStory, generateStoryImage, speakText } from '../ui.js';
import { generateText } from './ai.js';
import { gainExperience, useClassAbility } from './character.js';
import { generateWorldMap } from './map.js';

export async function startGame() {
    const loadingIndicator = document.getElementById('backgroundLoadingIndicator');
    loadingIndicator.hidden = false;

    try {
        const difficultyDesc = difficultySettings[userProfile.difficulty].description;
        const gameIntro = await generateText(`...`); // Prompt remains the same

        window.story = gameIntro; // Use window for global access
        updateStory();
        speakText(window.story);
        generateStoryImage(`${userProfile.gender} ${userProfile.race} ${userProfile.class} character...`);
        await generateWorldMap();
        await generateChoices();

    } catch (error) {
        console.error("Error starting game:", error);
        window.story = "The dark forces stir as you begin your journey...";
        updateStory();
    } finally {
        loadingIndicator.hidden = true;
    }
}

export async function generateChoices() {
    const choicesCtn = document.getElementById('choicesCtn');
    choicesCtn.innerHTML = ''; // Clear existing choices

    // This is the same as before...
    const choicesPrompt = `...`;
    const choicesText = await generateText(choicesPrompt);
    window.choices = choicesText.split('\n').map((line, index) => {
        const [text, consequence] = line.split('|').map(part => part.trim());
        return { id: index, text, consequence };
    });

    // **THIS IS THE CORRECTED PART**
    window.choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        // Assign the globally exposed makeChoice function
        button.onclick = () => window.makeChoice(choice.id); 
        choicesCtn.appendChild(button);
    });
}

export async function makeChoice(choiceId) {
    const choice = window.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // ... rest of the makeChoice function is the same ...
    window.story += `\n\n${choice.text}`;
    const response = await generateText(`...`);
    window.story += `\n\n${response}`;
    updateStory();
    // ...
}

export function makeCustomChoice() {
    // ... same as before ...
}

async function processCustomChoice(customAction) {
    // ... same as before ...
}