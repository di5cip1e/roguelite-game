// js/state.js
// Contains all the dynamic variables that track the game's current state.

// Core game variables
export let story = "";
export let choices = [];
export let currentChoice = -1;
export let userProfile = { difficulty: "adventurer", race: "", gender: "", class: "", background: "", talent: "", nswsfwEnabled: false };

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

// Inventory and Items
export let inventory = [];
export let equippedWeapon = null;
export let equippedSpell = null;
export let equippedArmor = null;
export let keptItems = [];

// Tracking and State Management
export let playerChoices = [];
export let relationships = {};
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

// System States
export let combatSystem = { inCombat: false, currentEnemy: null, playerDefending: false, enemyDefending: false, turnCount: 0, playerEffects: [], enemyEffects: [] };
export let ttsSystem = { enabled: false, speaking: false, voice: null, queue: [], utterance: null };
export let repgElements = { worldLore: [], quests: [] };
export let mapSystem = { canvas: null, ctx: null, initialized: false, locations: {}, paths: [], currentLocation: null, selectedPath: null, playerMarker: { x: 0, y: 0 }, mapImage: null, locationImages: {} };
export let eventSystem = { eventTypes: ["combat", "dialogue", "discovery", "trap", "rest", "merchant", "quest"], eventPool: {}, lastEventType: null };

// UI and Misc States
export let credits = 1;
export let menuOpen = false;
export let displaySettings = {
    textColor: "#c7a758", textSize: "100%", fontFamily: "'Crimson Pro', serif",
    backgroundColor: "rgba(15, 12, 5, 0.8)", borderColor: "#634d22", borderStyle: "solid"
};
export let diceValue = 0;