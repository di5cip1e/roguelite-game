// js/systems/game-loop.js
// Manages the core flow of the game, including starting, generating choices, and processing them.

import { story, choices, userProfile, playerChoices } from '../state.js';
import { difficultySettings } from '../data.js';
import { updateStory, generateStoryImage, speakText } from '../ui.js';
import { generateText } from './ai.js';
import { gainExperience } from './character.js';
import { generateWorldMap } from './map.js';

// A helper function to safely update the story state from modules
function appendStory(text) {
    // In a more complex app, this would be a robust state management function.
    // For now, we'll assume a global 'story' variable exists for simplicity of transition.
    window.story = (window.story || "") + text;
    updateStory(window.story);
}

export async function startGame() {
    const loadingIndicator = document.getElementById('backgroundLoadingIndicator');
    loadingIndicator.hidden = false;

    try {
        const difficultyDesc = difficultySettings[userProfile.difficulty].description;
        const gameIntro = await generateText(`
            Write a 3-paragraph introduction to a dark fantasy adventure game.
            The player is a ${userProfile.gender} ${userProfile.race} ${userProfile.class} with a ${userProfile.background} background.
            They have a special talent: ${userProfile.talent}.
            ${difficultyDesc}
            ${userProfile.race === 'succubus' ? 'As a succubus, you possess demonic charm and an affinity for dark magic, but must feed on life essence to maintain your power.' : ''}
            ${userProfile.race === 'vampire' ? 'As a vampire, you possess supernatural strength and immortality, but must feed on blood to maintain your power and are vulnerable to sunlight.' : ''}
            The tone should be mysterious and atmospheric. Don't use the word "adventure" too much.
            Keep paragraphs short (2-3 sentences each). Don't reveal too much, just set the scene.
        `);

        story = gameIntro; // Set initial story
        updateStory();
        speakText(story);
        generateStoryImage(`${userProfile.gender} ${userProfile.race} ${userProfile.class} character in dark fantasy setting, atmospheric, detailed`);
        await generateWorldMap();
        await generateChoices();

    } catch (error) {
        console.error("Error starting game:", error);
        story = "The dark forces stir as you begin your journey...";
        updateStory();
    } finally {
        loadingIndicator.hidden = true;
    }
}

export async function generateChoices() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const choicesCtn = document.getElementById('choicesCtn');
    
    try {
        loadingIndicator.hidden = false;
        choicesCtn.innerHTML = ''; // Clear existing choices

        const choicesPrompt = `
            Based on the following story in a dark fantasy RPG, generate ${difficultySettings[userProfile.difficulty].choiceCount} distinct and interesting choices for the player.
            STORY:
            ${story}
            PLAYER:
            - Race: ${userProfile.race} - Gender: ${userProfile.gender} - Class: ${userProfile.class} - Background: ${userProfile.background} - Talent: ${userProfile.talent}
            ${userProfile.race === 'succubus' ? 'Include at least one choice that utilizes the succubus\'s charm abilities or demonic nature if contextually appropriate.' : ''}
            ${userProfile.race === 'vampire' ? 'Include at least one choice that utilizes the vampire\'s blood feeding abilities or powers of the night if contextually appropriate.' : ''}
            FORMAT EACH CHOICE LIKE THIS (without the <> brackets):
            <Choice 1>|<Brief consequence hint>
            <Choice 2>|<Brief consequence hint>
        `;

        const choicesText = await generateText(choicesPrompt);
        const choiceLines = choicesText.split('\n').map(line => line.trim()).filter(line => line.includes('|'));

        choices = choiceLines.map((line, index) => {
            const [text, consequence] = line.split('|').map(part => part.trim());
            return { id: index, text, consequence };
        });

        choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            if (choice.consequence) {
                const consequenceSpan = document.createElement('span');
                consequenceSpan.className = 'consequenceTag';
                consequenceSpan.textContent = choice.consequence;
                button.appendChild(consequenceSpan);
            }
            button.onclick = () => makeChoice(choice.id);
            choicesCtn.appendChild(button);
        });

    } catch (error) {
        console.error("Error generating choices:", error);
        // Fallback choices
    } finally {
        loadingIndicator.hidden = true;
    }
}

export async function makeChoice(choiceId) {
    const choice = choices.find(c => c.id === choiceId);
    if (!choice) return;

    document.getElementById('loadingIndicator').hidden = false;

    try {
        story += `\n\n${choice.text}`;
        
        const isCharmChoice = userProfile.race === 'succubus' && (choice.text.toLowerCase().includes('seduce') || choice.text.toLowerCase().includes('charm'));
        const isVampireChoice = userProfile.race === 'vampire' && (choice.text.toLowerCase().includes('blood') || choice.text.toLowerCase().includes('feed'));

        const responsePrompt = `
            The player in a dark fantasy RPG has chosen: "${choice.text}"
            Based on the current story context: ${story}
            PLAYER: - Race: ${userProfile.race} - Gender: ${userProfile.gender} - Class: ${userProfile.class}
            ${isCharmChoice ? 'This choice involves using succubus charm. Describe how they manipulate their target with supernatural allure.' : ''}
            ${isVampireChoice ? 'This choice involves using vampire abilities. Describe how they use their vampiric powers or feed.' : ''}
            Write a 1-2 paragraph response describing the immediate consequences.
            Keep it immersive and impactful. Use rich sensory details${userProfile.nsfwEnabled ? ' and do not shy away from mature themes.' : ''}.
        `;
        
        const response = await generateText(responsePrompt);
        story += `\n\n${response}`;
        updateStory();
        speakText(response);

        // Generate a new image and new choices
        generateStoryImage(`${choice.text} ${response.substring(0, 100)} fantasy scene, atmospheric, detailed`);
        gainExperience(10);
        playerChoices.push({ choice: choice.text, consequence: choice.consequence, timestamp: new Date().toISOString() });
        generateChoices();

    } catch (error) {
        console.error("Error processing choice:", error);
    } finally {
        document.getElementById('loadingIndicator').hidden = false;
    }
}

export function makeCustomChoice() {
    const customInput = document.getElementById('customChoiceInput');
    const customAction = customInput.value.trim();
    if (!customAction) {
        customInput.focus();
        customInput.style.borderColor = "#ff4081";
        setTimeout(() => { customInput.style.borderColor = "#634d22"; }, 2000);
        return;
    }
    document.getElementById('loadingIndicator').hidden = false;
    processCustomChoice(customAction);
    customInput.value = '';
}

async function processCustomChoice(customAction) {
    try {
        const response = await generateText(`
            The player in a dark fantasy RPG wants to: "${customAction}"
            Based on the current story context: ${story}
            PLAYER: - Race: ${userProfile.race} - Gender: ${userProfile.gender} - Class: ${userProfile.class}
            Write a 1-2 paragraph response to this action. Be creative but fair. Describe the immediate consequences.
        `);
        story += `\n\n${customAction}\n\n${response}`;
        updateStory();
        speakText(response);
        generateStoryImage(`${customAction}, fantasy scene, atmospheric, detailed`);
        generateChoices();
    } catch (error) {
        console.error("Error processing custom choice:", error);
    } finally {
        document.getElementById('loadingIndicator').hidden = true;
    }
}