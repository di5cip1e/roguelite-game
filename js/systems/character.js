// js/systems/character.js
// Manages player character creation, stats, abilities, and progression.

import { userProfile, characterStats, gameState, keptItems, story } from '../state.js';
import { difficultySettings, classAbilities, talentEffects } from '../data.js';
import { updateStatsDisplay, updateStory } from '../ui.js';
import { startGame } from './game-loop.js';
// Note: We will create the combat functions this file imports later.
import { endCombat, performEnemyAction, updatePlayerHealth, updateEnemyHealth } from './combat.js';

export function initCharacterCreation() {
    const profileModal = document.getElementById('profileModal');

    // Set default difficulty
    document.querySelectorAll('.profileOption[data-default="true"]').forEach(option => {
      option.classList.add('selected');
    });

    // Set up event handlers for profile options
    profileModal.querySelectorAll('.profileOption').forEach(option => {
      option.addEventListener('click', function() {
        const optionType = this.getAttribute('data-option');
        document.querySelectorAll(`.profileOption[data-option="${optionType}"]`).forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');

        if (this.getAttribute('data-value') === 'custom') {
          this.querySelector('input').focus();
        }
      });
    });

    // Select first option in each category by default if none is selected
    const categories = ['race', 'gender', 'class', 'background', 'talent'];
    categories.forEach(category => {
      if (!profileModal.querySelector(`.profileOption[data-option="${category}"].selected`)) {
        profileModal.querySelector(`.profileOption[data-option="${category}"]`)?.classList.add('selected');
      }
    });

    // Load any kept items from previous runs
    if (localStorage.keptItems) {
      try {
        keptItems = JSON.parse(localStorage.keptItems);
      } catch (e) {
        console.error("Error loading kept items:", e);
        keptItems = [];
      }
    }
}

export function saveProfile() {
    const requiredCategories = ['difficulty', 'race', 'gender', 'class', 'background', 'talent'];
    if (requiredCategories.some(cat => !document.querySelector(`.profileOption[data-option="${cat}"].selected`))) {
        alert('Please make a selection for all categories.');
        return;
    }

    document.querySelectorAll('.profileOption.selected').forEach(option => {
        const optionType = option.getAttribute('data-option');
        let optionValue = option.getAttribute('data-value');
        if (optionValue === 'custom') {
            const inputField = option.querySelector('input');
            if (inputField && inputField.value.trim()) {
                optionValue = inputField.value.trim();
            }
        }
        userProfile[optionType] = optionValue;
    });

    userProfile.nsfwEnabled = document.getElementById('nsfwToggle').checked;

    initializeCharacterStats();
    initializeClassAbilities();
    initializeTalentEffects();

    document.getElementById('profileModal').classList.remove('active');
    startGame();
}

export function initializeCharacterStats() {
    // Reset to defaults
    characterStats.health = 100;
    characterStats.maxHealth = 100;
    characterStats.strength = 10;
    characterStats.agility = 10;
    characterStats.intelligence = 10;
    characterStats.luck = 10;
    characterStats.level = 1;
    characterStats.experience = 0;
    characterStats.experienceToNextLevel = 100;

    // Apply race-specific stat adjustments
    switch(userProfile.race) {
        case 'human': characterStats.strength += 2; characterStats.agility += 2; characterStats.intelligence += 2; characterStats.luck += 2; break;
        case 'elf': characterStats.agility += 5; characterStats.intelligence += 3; characterStats.strength -= 2; break;
        case 'dwarf': characterStats.strength += 4; characterStats.maxHealth += 15; characterStats.agility -= 2; break;
        case 'orc': characterStats.strength += 7; characterStats.maxHealth += 20; characterStats.intelligence -= 4; break;
        case 'succubus': characterStats.intelligence += 4; characterStats.agility += 3; characterStats.luck += 3; characterStats.maxHealth -= 5; gameState.flags.has_charm = true; break;
        case 'vampire': characterStats.strength += 5; characterStats.agility += 4; characterStats.intelligence += 3; characterStats.maxHealth -= 10; gameState.flags.has_blood_feeding = true; gameState.flags.sunlight_weakness = true; break;
    }

    // Apply class-specific stat adjustments
    switch(userProfile.class) {
        case 'rogue': characterStats.agility += 5; characterStats.luck += 3; characterStats.strength -= 2; break;
        case 'occultist': characterStats.intelligence += 8; characterStats.strength -= 3; characterStats.maxHealth = 80; break;
        case 'amazon': characterStats.strength += 6; characterStats.maxHealth += 20; characterStats.intelligence -= 2; break;
        case 'necromancer': characterStats.intelligence += 5; characterStats.luck += 2; characterStats.maxHealth -= 10; break;
    }

    // Apply difficulty modifiers
    const difficultyMod = difficultySettings[userProfile.difficulty].healthMod;
    characterStats.maxHealth = Math.floor(characterStats.maxHealth * difficultyMod);
    characterStats.health = characterStats.maxHealth; // Start at full health

    updateStatsDisplay();
}

export function initializeClassAbilities() {
    const abilityList = document.getElementById('abilityList');
    abilityList.innerHTML = '';
    gameState.activeAbilities = [];

    if (classAbilities[userProfile.class]) {
        classAbilities[userProfile.class].forEach(ability => {
            gameState.activeAbilities.push({ ...ability }); // Add a copy to state
            const abilityItem = document.createElement('div');
            abilityItem.className = 'abilityItem';
            abilityItem.innerHTML = `
                <div class="abilityIcon">${ability.icon}</div>
                <div class="abilityInfo">
                    <h4 class="abilityName">${ability.name}</h4>
                    <p class="abilityDesc">${ability.description}</p>
                    <span class="abilityCooldown">${ability.cooldown}</span>
                    ${ability.usable ? `<button class="classAbilityBtn ${ability.buttonClass}" onclick="useClassAbility('${ability.effect}')">Use</button>` : ''}
                </div>
            `;
            abilityList.appendChild(abilityItem);
        });
    } else {
        abilityList.innerHTML = '<p class="text-muted-center">No class abilities available</p>';
    }
}

export function initializeTalentEffects() {
    gameState.talentEffects = {};
    if (talentEffects[userProfile.talent]) {
        gameState.talentEffects[userProfile.talent] = talentEffects[userProfile.talent];
        if (gameState.talentEffects[userProfile.talent].reset) {
            gameState.talentEffects[userProfile.talent].reset();
        }
    }
}

export function gainExperience(amount) {
    characterStats.experience += amount;
    if (characterStats.experience >= characterStats.experienceToNextLevel) {
        characterStats.level++;
        characterStats.experience -= characterStats.experienceToNextLevel;
        characterStats.experienceToNextLevel = Math.floor(characterStats.experienceToNextLevel * 1.5);

        characterStats.maxHealth += 10;
        characterStats.health = characterStats.maxHealth;

        switch(userProfile.class) {
            case 'rogue': characterStats.agility += 2; characterStats.luck += 1; break;
            case 'occultist': characterStats.intelligence += 2; characterStats.luck += 1; break;
            case 'amazon': characterStats.strength += 2; characterStats.agility += 1; break;
            case 'necromancer': characterStats.intelligence += 2; characterStats.strength += 1; break;
            default: characterStats.strength += 1; characterStats.agility += 1; characterStats.intelligence += 1; break;
        }

        story += `\n\n*You have reached level ${characterStats.level}! Your abilities have grown stronger.*`;
        updateStory();
    }
    updateStatsDisplay();
}

export function useClassAbility(abilityEffect) {
    // This is a placeholder for the full combat-integrated ability usage
    console.log("Using ability:", abilityEffect);
    story += `\n\nYou attempt to use your ability: ${abilityEffect}.`;
    updateStory();
}

export function restartGame() {
    console.log("Restarting game...");
    // This would eventually reset all state and show the profile modal again.
    location.reload();
}