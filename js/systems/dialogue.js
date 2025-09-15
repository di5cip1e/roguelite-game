// js/systems/dialogue.js
// Handles all logic for NPC interactions and dialogue trees.

import { gameState, relationships, story } from '../state.js';
import { npcTemplates } from '../data.js';
import { updateDialogueVisibility, updateStory, speakText } from '../ui.js';
import { generateText, generateImage } from './ai.js';
import { generateChoices } from './game-loop.js';

export async function generateDialogueEvent() {
    gameState.dialogueActive = true;
    updateDialogueVisibility();

    const npcTypes = Object.keys(npcTemplates);
    const npcType = npcTypes[Math.floor(Math.random() * npcTypes.length)];
    const npc = { ...npcTemplates[npcType] }; // Use a copy of the template

    const npcName = npc.name;
    if (relationships[npcName]) {
        npc.attitude = relationships[npcName].attitude;
    } else {
        relationships[npcName] = { score: 0, attitude: npc.attitude };
    }

    // Update UI elements
    document.getElementById('npcName').textContent = npcName;
    updateNpcAttitudeUI(npcName);
    
    try {
        const npcPortrait = await generateImage(`Fantasy portrait of ${npc.name}, ${npc.description}, detailed, game art style`);
        document.getElementById('npcPortrait').src = npcPortrait;
    } catch (error) {
        console.error("Failed to generate NPC portrait:", error);
    }

    const encounterNarrative = await generateText(`
        Write a brief paragraph (2-3 sentences) about the player encountering ${npcName}, who is ${npc.description}.
        This NPC's attitude toward the player is "${npc.attitude}".
        Describe their appearance and initial greeting or behavior.
    `);

    story += `\n\n${encounterNarrative}`;
    updateStory();
    speakText(encounterNarrative);

    // Start dialogue from the beginning
    displayDialogueNode(npc, 'greeting');
}

export function handleDialogueChoice(npc, choice) {
    if (choice.nextNode === 'end') {
        endDialogue(npc, choice);
        return;
    }

    const nextNode = npc.dialogues[choice.nextNode];
    if (!nextNode) {
        console.error(`Dialogue node "${choice.nextNode}" not found for NPC ${npc.name}`);
        endDialogue(npc, choice, true); // End dialogue gracefully
        return;
    }

    story += `\n\nYou say: "${choice.text}"\n\n${npc.name} responds: "${nextNode.text}"`;
    updateStory();
    speakText(nextNode.text);

    if (choice.impact) {
        updateNpcAttitude(npc.name, choice.impact);
    }
    
    displayDialogueNode(npc, choice.nextNode);
}

function displayDialogueNode(npc, nodeKey) {
    const node = npc.dialogues[nodeKey];
    if (!node) return;

    document.getElementById('dialogueContent').textContent = node.text;
    const dialogueChoicesCtn = document.getElementById('dialogueChoices');
    dialogueChoicesCtn.innerHTML = '';

    node.choices.forEach(choice => {
        let canChoose = !choice.requires || gameState.flags[choice.requires];
        if (canChoose) {
            const choiceBtn = document.createElement('button');
            choiceBtn.className = 'dialogueChoice';
            choiceBtn.textContent = choice.text;
            // Recreate the NPC object for the event handler to ensure it's the correct one
            choiceBtn.onclick = () => handleDialogueChoice({ ...npc }, choice);
            dialogueChoicesCtn.appendChild(choiceBtn);
        }
    });
}

export function endDialogue(npc, choice, graceful = false) {
    gameState.dialogueActive = false;
    updateDialogueVisibility();

    if (!graceful) {
        const farewellNode = npc.dialogues.farewell || { text: "Our conversation ends." };
        story += `\n\nYou say: "${choice.text}"\n\n${npc.name} nods. ${farewellNode.text}`;
    }
    
    updateStory();
    generateChoices();
}

function updateNpcAttitude(npcName, impact) {
    if (!relationships[npcName]) return;

    switch (impact) {
        case 'shop': case 'rest': case 'knowledge': case 'payment': relationships[npcName].score += 1; break;
        case 'quest': case 'friendship': relationships[npcName].score += 2; break;
        case 'reputation': relationships[npcName].score -= 1; break;
        case 'hostile': case 'threaten': relationships[npcName].score -= 3; break;
    }

    const score = relationships[npcName].score;
    if (score >= 5) relationships[npcName].attitude = 'friendly';
    else if (score >= -2) relationships[npcName].attitude = 'neutral';
    else if (score >= -5) relationships[npcName].attitude = 'unfriendly';
    else relationships[npcName].attitude = 'hostile';
    
    updateNpcAttitudeUI(npcName);
}

function updateNpcAttitudeUI(npcName) {
    if (!relationships[npcName]) return;
    const attitude = relationships[npcName].attitude;
    const attitudeSpan = document.querySelector('#npcAttitude .relationshipIndicator');
    if (attitudeSpan) {
        attitudeSpan.className = `relationshipIndicator ${attitude}`;
        attitudeSpan.textContent = attitude.charAt(0).toUpperCase() + attitude.slice(1);
    }
}