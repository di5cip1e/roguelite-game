// js/state.js
// Contains all the dynamic variables that track the game's current state.

// Dice system variables
export let currentDiceType = "d20", diceCount = 1, diceModifier = 0, diceResults = [], diceTotal = 0, diceValue = 0;

// Core game variables
export let story = "", choices = [], currentChoice = -1;
export let userProfile = { difficulty: "adventurer", race: "", gender: "", class: "", background: "", talent: "", nsfwEnabled: false };

// Character stats
export let characterStats = {
    health: 100,
    maxHealth: 100,
    strength: 10,
    agility: 10,
    intelligence: 10,
    luck: 10,
    level: 1,
    experience: 0,
    experienceToNextLevel: 100
};

// Inventory system
export let inventory = [], equippedWeapon = null, equippedSpell = null, equippedArmor = null, keptItems = [];

// Player choices tracking
export let playerChoices = [];

// NPC relationship system
export let relationships = {};

// Overall game state tracking
export let gameState = {
    currentLocation: "",
    previousLocations: [],
    flags: {},
    questProgress: {},
    combatActive: false,
    dialogueActive: false,
    needsDiceRoll: false,
    activeAbilities: [],
    talentEffects: {}
};

// Combat system state
export let combatSystem = { inCombat: false, currentEnemy: null, playerDefending: false, enemyDefending: false, turnCount: 0, playerEffects: [], enemyEffects: [] };

// Text-to-Speech (TTS) System state
export let ttsSystem = { enabled: false, speaking: false, voice: null, queue: [], utterance: null };

// Role-Playing Game Elements (Lore & Quests)
export let repgElements = { worldLore: [], quests: [] };

// Map System state
export let mapSystem = { canvas: null, ctx: null, initialized: false, locations: {}, paths: [], currentLocation: null, selectedPath: null, playerMarker: { x: 0, y: 0 }, mapImage: null, locationImages: {} };

// Event Generation System state
export let eventSystem = { eventTypes: ["combat", "dialogue", "discovery", "trap", "rest", "merchant", "quest"], eventPool: {}, lastEventType: null };

// Arcade machine specific variables
export let credits = 1;

// Game menu state
export let menuOpen = false;

// Display settings object to store current preferences
export let displaySettings = {
    textColor: "#c7a758", textSize: "100%", fontFamily: "'Crimson Pro', serif",
    backgroundColor: "rgba(15, 12, 5, 0.8)", borderColor: "#634d22", borderStyle: "solid",
    crtEffect: true, scanlines: true
};