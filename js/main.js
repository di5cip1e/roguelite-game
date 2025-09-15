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

// --- Import UI Modules ---
import { toggleGameMenu, showFeature, showDiceRoller, initTTS, toggleTTS } from './ui.js';

// --- Global Function Exposure ---
// To make functions accessible from the HTML onclick attributes,
// we attach them to the global 'window' object.
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

    // Show the profile modal to start the character creation process
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.add('active');
    } else {
        console.error("Profile modal not found! Game cannot start.");
    }
});