// js/ui.js
// Contains all functions that directly manipulate the DOM (the HTML) to update what the player sees.

import { story, characterStats, gameState, userProfile, repgElements, ttsSystem, menuOpen } from './state.js';
import { generateImage } from './systems/ai.js';

// --- Core UI Updates ---

export function updateStory() {
    document.getElementById('storyCtn').textContent = story;
    document.getElementById('storyCtn').scrollTop = document.getElementById('storyCtn').scrollHeight; // Auto-scroll to bottom
}

export function updateStatsDisplay() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    // Create stats display with added level and talent indicator
    let talentHtml = '';
    if (gameState.talentEffects[userProfile.talent] && gameState.talentEffects[userProfile.talent].name) {
      const talent = gameState.talentEffects[userProfile.talent];
      talentHtml = `<span class="talentIndicator ${talent.icon}">${talent.name}</span>`;
    } else if (userProfile.talent && !gameState.talentEffects[userProfile.talent]) {
        // Handle custom talent display
        talentHtml = `<span class="talentIndicator luckyTalent">Custom</span>`;
    }

    statsGrid.innerHTML = `
      <div class="statItem">
        <span class="statName">Level</span>
        <span class="statValue">${characterStats.level}</span>
      </div>
      <div class="statItem">
        <span class="statName">Health</span>
        <span class="statValue">${characterStats.health}/${characterStats.maxHealth}</span>
      </div>
      <div class="statItem">
        <span class="statName">Strength</span>
        <span class="statValue">${characterStats.strength}</span>
      </div>
      <div class="statItem">
        <span class="statName">Agility</span>
        <span class="statValue">${characterStats.agility}</span>
      </div>
      <div class="statItem">
        <span class="statName">Intelligence</span>
        <span class="statValue">${characterStats.intelligence}</span>
      </div>
      <div class="statItem">
        <span class="statName">Luck</span>
        <span class="statValue">${characterStats.luck}</span>
      </div>
      <div class="statItem">
        <span class="statName">Talent</span>
        ${talentHtml}
      </div>
      <div class="statItem">
        <span class="statName">XP</span>
        <span class="statValue">${characterStats.experience}/${characterStats.experienceToNextLevel}</span>
      </div>
    `;
}

export async function generateStoryImage(description) {
    try {
        document.getElementById('loadingIndicator').hidden = false;
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


// --- Visibility Toggles ---

export function updateDialogueVisibility() {
    const dialogueCtn = document.getElementById('dialogueCtn');
    dialogueCtn.hidden = !gameState.dialogueActive;
}

export function updateCombatVisibility() {
    const combatCtn = document.getElementById('combatCtn');
    combatCtn.hidden = !gameState.combatActive;
}

export function showDiceRoller() {
    document.getElementById('diceSection').classList.add('active');
    gameState.needsDiceRoll = true;
}


// --- Menu & Feature Panel Management ---

export function toggleGameMenu() {
    menuOpen = !menuOpen;
    const gameMenu = document.getElementById('gameMenu');
    if (menuOpen) {
        gameMenu.classList.add('open');
    } else {
        gameMenu.classList.remove('open');
    }
}

export function showFeature(feature) {
    toggleGameMenu(); // Hide the menu first

    // Hide all feature containers before showing the selected one
    document.getElementById('inventoryCtn').style.display = 'none';
    document.getElementById('mapContainer').style.display = 'none';
    document.getElementById('worldLoreElement').style.display = 'none';
    document.getElementById('displaySettingsCtn').style.display = 'none';

    switch (feature) {
        case 'characterStats':
            // Stats are always visible, so we just scroll to them
            document.getElementById('characterStatsCtn').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'inventory':
            document.getElementById('inventoryCtn').style.display = 'block';
            break;
        case 'worldMap':
            document.getElementById('mapContainer').style.display = 'block';
            break;
        case 'worldLore':
            document.getElementById('worldLoreElement').style.display = 'block';
            break;
        case 'questJournal':
            document.getElementById('questJournalElement').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'diceRoller':
            showDiceRoller();
            break;
        case 'customChoice':
            document.getElementById('customChoiceInput').focus();
            break;
        case 'ttsControls':
            document.getElementById('ttsControlsCtn').scrollIntoView({ behavior: 'smooth' });
            break;
        case 'textToImage':
            document.getElementById('textToImageCtn').style.display = 'block';
            document.getElementById('textToImageInput').focus();
            break;
        case 'imageToText':
            document.getElementById('imageToTextCtn').style.display = 'block';
            break;
        case 'displaySettings':
            // You would call a function here to show and populate the settings
            console.log("Showing Display Settings (functionality to be added to settings.js)");
            break;
    }
}


// --- Text-to-Speech (TTS) ---

function selectMaleVoice(voices) {
    let maleVoice = voices.find(voice =>
        voice.name.toLowerCase().includes('male') ||
        voice.name.includes('David') ||
        voice.name.includes('Mark') ||
        voice.name.includes('Daniel')
    );
    ttsSystem.voice = maleVoice || voices[0];
    console.log("Selected voice:", ttsSystem.voice ? ttsSystem.voice.name : "None available");
}

export function initTTS() {
    if ('speechSynthesis' in window) {
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            speechSynthesis.addEventListener('voiceschanged', () => {
                voices = speechSynthesis.getVoices();
                selectMaleVoice(voices);
            });
        } else {
            selectMaleVoice(voices);
        }
    } else {
        console.log("TTS not supported in this browser");
        document.getElementById('ttsControlsCtn').style.display = 'none';
    }
}

export function speakText(text) {
    if (!ttsSystem.enabled || !speechSynthesis) return;

    try {
        speechSynthesis.cancel();
        let utterance = new SpeechSynthesisUtterance(text);
        if (ttsSystem.voice) {
            utterance.voice = ttsSystem.voice;
        }
        utterance.pitch = 0.9;
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
        ttsSystem.speaking = true;
        utterance.onend = () => {
            ttsSystem.speaking = false;
        };
    } catch (error) {
        console.error("TTS error:", error);
    }
}

export function toggleTTS() {
    ttsSystem.enabled = !ttsSystem.enabled;

    let toggleBtn = document.getElementById('toggleTtsBtn');
    let ttsIcon = toggleBtn.querySelector('.ttsIcon');
    let buttonText = document.getElementById('ttsButtonText');

    if (ttsSystem.enabled) {
        toggleBtn.classList.add('active');
        ttsIcon.textContent = '🔊';
        buttonText.textContent = 'Disable Narrator';
        if (story && story.trim().length > 0) {
            speakText(story);
        }
    } else {
        toggleBtn.classList.remove('active');
        ttsIcon.textContent = '🔈';
        buttonText.textContent = 'Enable Narrator';
        if (speechSynthesis) {
            speechSynthesis.cancel();
            ttsSystem.speaking = false;
            ttsSystem.queue = [];
        }
    }
}


// --- REPG (Lore & Quest) UI ---

export function updateLoreDisplay() {
    let loreHtml = '';
    if (repgElements.worldLore.length === 0) {
        loreHtml = '<p class="text-muted-center">No lore entries discovered yet</p>';
    } else {
        repgElements.worldLore.forEach(lore => {
            loreHtml += `<div class="loreEntry"><h4>${lore.title}</h4><p>${lore.content}</p></div>`;
        });
    }
    document.getElementById('loreEntries').innerHTML = loreHtml;
}

export function updateQuestDisplay() {
    let questHtml = '';
    if (repgElements.quests.length === 0) {
        questHtml = '<p class="text-muted-center">No active quests</p>';
    } else {
        repgElements.quests.forEach(quest => {
            let statusClass = '';
            let statusText = '';
            switch (quest.status) {
                case 'active': statusClass = 'questActive'; statusText = 'Active'; break;
                case 'completed': statusClass = 'questCompleted'; statusText = 'Completed'; break;
                case 'failed': statusClass = 'questFailed'; statusText = 'Failed'; break;
            }
            questHtml += `<div class="questEntry"><h4>${quest.title} <span class="questStatus ${statusClass}">${statusText}</span></h4><p>${quest.description}</p></div>`;
        });
    }
    document.getElementById('questEntries').innerHTML = questHtml;
}