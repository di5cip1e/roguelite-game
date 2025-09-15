// js/main.js
// The main entry point for the application.
// This file imports functions from all other modules and initializes the game.

// --- Import System Modules ---
import { generateImageFromText, generateTextFromImage } from './systems/ai.js';
import { initCharacterCreation, saveProfile, restartGame, useClassAbility } from './systems/character.js';
import { performCombatAction } from './systems/combat.js';
import { initDiceSystem, rollTheBones, continueAfterRoll } from './systems/dice.js';
import { makeChoice, makeCustomChoice } from './systems/game-loop.js';
import { initMapSystem, travelToLocation, selectPath } from './systems/map.js';
import { initSettings, showDisplaySettings } from './systems/settings.js';

// --- Import UI Modules ---
import { toggleGameMenu, showFeature, showDiceRoller, initTTS, toggleTTS } from './ui.js';

// --- Global Function Exposure ---
// This is the CRITICAL part. It makes the functions available to the HTML.
window.saveProfile = saveProfile;
window.restartGame = restartGame;
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

// These functions are attached to buttons that are created dynamically by other scripts,
// so they don't need to be on the window object.
// We just need to make sure the scripts that create the buttons import them correctly.
// For example, game-loop.js creates choice buttons and assigns makeChoice to their onclick.

// --- Game Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    // Initialize all the different systems
    initCharacterCreation();
    initDiceSystem();
    initMapSystem();
    initSettings();
    initTTS();

    // Show the profile modal to start the character creation process
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.add('active');
    } else {
        console.error("Profile modal not found! Game cannot start.");
    }
});