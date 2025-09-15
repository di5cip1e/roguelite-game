// js/state.js
// Contains all the dynamic variables that track the game's current state.

export let story = "", choices = [], currentChoice = -1;
export let userProfile = { difficulty: "adventurer", race: "", gender: "", class: "", background: "", talent: "", nsfwEnabled: false };
export let characterStats = {
    health: 100, maxHealth: 100, strength: 10, agility: 10, intelligence: 10,
    luck: 10, level: 1, experience: 0, experienceToNextLevel: 100
};
export let inventory = [], equippedWeapon = null, equippedSpell = null, equippedArmor = null, keptItems = [];
export let playerChoices = [];
export let relationships = {};
export let gameState = {
    currentLocation: "", previousLocations: [], flags: {}, questProgress: {}, combatActive: false,
    dialogueActive: false, needsDiceRoll: false, activeAbilities: [], talentEffects: {}
};
export let combatSystem = { inCombat: false, currentEnemy: null, playerDefending: false, enemyDefending: false, turnCount: 0, playerEffects: [], enemyEffects: [] };
export let ttsSystem = { enabled: false, speaking: false, voice: null, queue: [], utterance: null };
export let repgElements = { worldLore: [], quests: [] };
export let mapSystem = { canvas: null, ctx: null, initialized: false, locations: {}, paths: [], currentLocation: null, selectedPath: null, playerMarker: { x: 0, y: 0 }, mapImage: null, locationImages: {} };
export let eventSystem = { eventTypes: ["combat", "dialogue", "discovery", "trap", "rest", "merchant", "quest"], eventPool: {}, lastEventType: null };
export let credits = 1;
export let menuOpen = false;
export let displaySettings = {
    textColor: "#c7a758", textSize: "100%", fontFamily: "'Crimson Pro', serif",
    backgroundColor: "rgba(15, 12, 5, 0.8)", borderColor: "#634d22", borderStyle: "solid",
    crtEffect: true, scanlines: true
};

// --- DICE STATE ---
// We keep dice variables separate for clarity
export let currentDiceType = "d20", diceCount = 1, diceModifier = 0, diceResults = [], diceTotal = 0, diceValue = 0;

// --- NEWLY ADDED STATE SETTER FUNCTIONS ---
// These functions allow other modules to safely update the state variables in this file.
export function setStory(newStory) { story = newStory; }
export function appendStory(text) { story += text; }
export function setChoices(newChoices) { choices = newChoices; }
export function setCurrentDiceType(type) { currentDiceType = type; }
export function setDiceCount(count) { diceCount = count; }
export function setDiceModifier(mod) { diceModifier = mod; }
export function setDiceResults(results) { diceResults = results; }
export function setDiceTotal(total) { diceTotal = total; }
export function setDiceValue(value) { diceValue = value; }