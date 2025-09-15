// js/systems/events.js
// Handles the generation of random events during travel.

import { eventSystem, story, characterStats, repgElements, gameState } from '../state.js';
import { updateStory, speakText, generateStoryImage, updateStatsDisplay, updateLoreDisplay, updateQuestDisplay } from '../ui.js';
import { generateText } from './ai.js';
import { generateCombatEvent } from './combat.js';
import { generateDialogueEvent } from './dialogue.js';
import { generateChoices } from './game-loop.js';
import { difficultySettings } from '../data.js';

// --- REPG (Lore & Quest) Management ---
function addWorldLore(title, content) {
    repgElements.worldLore.push({ title, content, discovered: new Date().toISOString() });
    updateLoreDisplay();
}

function addQuest(title, description, status = 'active') {
    repgElements.quests.push({ title, description, status, started: new Date().toISOString(), completed: null });
    updateQuestDisplay();
}


// --- Event Generation ---

export async function generateTravelEvents(pathDangerLevel) {
    const eventCount = 1 + Math.floor(Math.random() * 2); // 1-2 events per journey
    for (let i = 0; i < eventCount; i++) {
        await generatePathEvent(pathDangerLevel);
    }
    // After events, generate new choices for the arrival at the new location
    story += `\n\nYou arrive at your destination.`;
    updateStory();
    generateChoices();
}

async function generatePathEvent(dangerLevel) {
    const probabilities = {
        combat: 0.2 * dangerLevel,
        dialogue: 0.4 - (0.1 * dangerLevel),
        discovery: 0.3,
        trap: 0.1 * dangerLevel,
        rest: Math.max(0.1, 0.3 - (0.05 * dangerLevel)), // Ensure rest is always possible
        quest: 0.15
    };

    const totalProb = Object.values(probabilities).reduce((sum, p) => sum + p, 0);
    let random = Math.random() * totalProb;
    let selectedEventType = 'generic'; // Fallback

    for (const type in probabilities) {
        if (random < probabilities[type]) {
            selectedEventType = type;
            break;
        }
        random -= probabilities[type];
    }
    
    // Avoid repeating the same event type if possible
    if (selectedEventType === eventSystem.lastEventType && Math.random() < 0.7) {
        selectedEventType = 'generic';
    }
    eventSystem.lastEventType = selectedEventType;

    switch (selectedEventType) {
        case 'combat': return generateCombatEvent(dangerLevel);
        case 'dialogue': return generateDialogueEvent();
        case 'discovery': return generateDiscoveryEvent();
        case 'trap': return generateTrapEvent(dangerLevel);
        case 'rest': return generateRestEvent();
        case 'quest': return generateQuestEvent();
        default: return generateGenericEvent();
    }
}

async function generateDiscoveryEvent() {
    const discoveryNarrative = await generateText(`Write a short paragraph about the player discovering an interesting item, a piece of lore, or a hidden landmark while traveling.`);
    story += `\n\n${discoveryNarrative}`;
    updateStory();
    speakText(discoveryNarrative);
    generateStoryImage(`Fantasy discovery, ancient ruins, hidden treasure, atmospheric, ${discoveryNarrative}`);
}

async function generateTrapEvent(dangerLevel) {
    let trapDetected = false;
    let talentMessage = "";
    if (gameState.talentEffects["sixth-sense"]?.effect("trap").detected) {
        trapDetected = true;
        talentMessage = gameState.talentEffects["sixth-sense"].message;
    }
    
    if (trapDetected) {
        const trapNarrative = await generateText(`Write a paragraph about the player detecting a dangerous trap thanks to their sixth sense. The warning was: "${talentMessage}"`);
        story += `\n\n${trapNarrative}`;
    } else {
        const damage = Math.floor((5 + (dangerLevel * 5)) * difficultySettings[characterStats.difficulty]?.damageReceived || 1);
        characterStats.health = Math.max(1, characterStats.health - damage);
        updateStatsDisplay();
        const trapNarrative = await generateText(`Write a paragraph about the player triggering a trap and taking ${damage} damage.`);
        story += `\n\n${trapNarrative}`;
    }
    updateStory();
    speakText(story.slice(-200)); // Speak the last part of the story
    generateStoryImage(`Fantasy trap, spike pit, arrow trap in a dungeon, dangerous`);
}

async function generateRestEvent() {
    const healAmount = Math.floor(characterStats.maxHealth * (0.3 + Math.random() * 0.2));
    characterStats.health = Math.min(characterStats.maxHealth, characterStats.health + healAmount);
    updateStatsDisplay();

    const restNarrative = await generateText(`Write a paragraph about the player finding a safe place to rest, recovering ${healAmount} health.`);
    story += `\n\n${restNarrative}`;
    updateStory();
    speakText(restNarrative);
    generateStoryImage(`Fantasy campfire, safe haven, sheltered cave, peaceful rest`);
}

async function generateQuestEvent() {
    const questTitle = await generateText(`Generate a short, catchy title (3-6 words) for a quest in a fantasy setting.`);
    const questDescription = await generateText(`Write a short paragraph describing the quest: "${questTitle}".`);

    addQuest(questTitle, questDescription);

    const questNarrative = await generateText(`Write a paragraph about how the player discovers the quest titled "${questTitle}".`);
    story += `\n\n${questNarrative}\n\n<i class="quest-update">New quest added: ${questTitle}</i>`;
    updateStory();
    speakText(questNarrative);
}

async function generateGenericEvent() {
    const genericNarrative = await generateText(`Write a short, atmospheric paragraph about a minor but interesting encounter while traveling (e.g., strange weather, wildlife, passing travelers).`);
    story += `\n\n${genericNarrative}`;
    updateStory();
    speakText(genericNarrative);
}