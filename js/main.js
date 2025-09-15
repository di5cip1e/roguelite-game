// js/main.js
// The main entry point for the application.
// This file imports functions from all other modules and initializes the game.

// --- Import System Modules ---
import { generateImageFromText, generateTextFromImage } from './systems/ai.js';
import { initCharacterCreation, saveProfile, restartGame, useClassAbility } from './systems/character.js';
import { initCombat, performCombatAction } from './systems/combat.js';
import { initDiceSystem, rollTheBones, continueAfterRoll } from './systems/dice.js';
import { makeChoice, makeCustomChoice } from './systems/game-loop.js';
import { initMapSystem, travelToLocation, selectPath } from './systems/map.js';
import { initSettings } from './systems/settings.js';
import { handleDialogueChoice } from './systems/dialogue.js';

// --- Import UI Modules ---
import { toggleGameMenu, showFeature, showDiceRoller, initTTS, toggleTTS } from './ui.js';

// --- NEW MENU FUNCTIONS ---
function newGame() {
    // Hide the start menu
    document.getElementById('startMenuCtn').classList.add('hidden');
    // Show the main game container
    document.getElementById('gameCtn').classList.remove('hidden');

    // Now, show the character creation screen to start the game
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.add('active');
    }
}

// THIS FUNCTION WAS MISSING
function continueGame() {
    // This is a placeholder for future save/load functionality
    alert("Continue game feature is not yet implemented.");
}


// --- Global Function Exposure ---
// This section makes the modular functions "public" so the HTML onclick attributes can find them.
window.newGame = newGame;
window.continueGame = continueGame;
window.saveProfile = saveProfile;
window.restartGame = restartGame;
window.makeChoice = makeChoice;
window.makeCustomChoice = makeCustomChoice;
window.performCombatAction = performCombatAction;
window.useClassAbility = useClassAbility;
window.rollTheBones = rollTheBones;
window.continueAfterRoll = continueAfterRoll;
window.travelToLocation = travelToLocation;
window.selectPath = selectPath;
window.toggleGameMenu = toggleGameMenu;
window.showFeature = showFeature;
window.showDiceRoller = showDiceRoller;
window.generateImageFromText = generateImageFromText;
window.generateTextFromImage = generateTextFromImage;
window.toggleTTS = toggleTTS;
window.handleDialogueChoice = handleDialogueChoice;


// --- Game Initialization ---
// This event listener waits for the HTML document to be fully loaded before running any scripts.
document.addEventListener("DOMContentLoaded", () => {
    // Initialize all the different systems
    initCharacterCreation();
    initCombat();
    initDiceSystem();
    initMapSystem();
    initSettings();
    initTTS();
    // THE EXTRA BRACE '}' WAS REMOVED FROM HERE
});