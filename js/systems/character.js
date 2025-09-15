// js/systems/character.js
// Manages player character creation, stats, abilities, and progression.

import { userProfile, characterStats, gameState, keptItems, story, appendStory, combatSystem } from '../state.js';
import { difficultySettings, classAbilities, talentEffects } from '../data.js';
import { updateStatsDisplay, updateStory } from '../ui.js';
import { startGame } from './game-loop.js';
import { endCombat, performEnemyAction, updatePlayerHealth, updateEnemyHealth } from './combat.js';

export function initCharacterCreation() {
    const profileModal = document.getElementById('profileModal');
    if (!profileModal) return;

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

    if (localStorage.keptItems) {
      try {
        window.keptItems = JSON.parse(localStorage.keptItems); // Use window scope for simplicity
      } catch (e) {
        console.error("Error loading kept items:", e);
        window.keptItems = [];
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

        appendStory(`\n\n*You have reached level ${characterStats.level}! Your abilities have grown stronger.*`);
        updateStory();
    }
    updateStatsDisplay();
}

export function useClassAbility(abilityEffect) {
    const ability = gameState.activeAbilities.find(a => a.effect === abilityEffect);
    if (!ability || !ability.usable) {
      console.log("Ability not usable or not found.");
      return;
    }

    if (!gameState.combatActive) {
        appendStory(`\n\nYou practice your ${ability.name} ability, readying it for the next encounter.`);
        updateStory();
        return;
    }

    const combatLog = document.getElementById('combatLog');
    let enemy = combatSystem.currentEnemy;
    let damage = 0;
    let healAmount = 0;

    switch (abilityEffect) {
        case "teleportBehindEnemy":
            combatLog.innerHTML += `<div class="combatMessage player">You use Shadow Step to teleport behind the enemy!</div>`;
            damage = Math.floor(characterStats.agility * 1.5) + Math.floor(Math.random() * 8);
            combatLog.innerHTML += `<div class="combatMessage player">You strike for <span class="damage critical">${damage} critical damage</span>!</div>`;
            enemy.health -= damage;
            break;
        case "lifeDrain":
            combatLog.innerHTML += `<div class="combatMessage player">You cast Life Drain, siphoning the enemy's vitality!</div>`;
            damage = Math.floor(characterStats.intelligence * 0.7) + Math.floor(Math.random() * 8);
            healAmount = Math.floor(damage * 0.5);
            combatLog.innerHTML += `<div class="combatMessage player">You drain <span class="damage">${damage} health</span> and heal yourself for <span class="healing">${healAmount}</span>!</div>`;
            enemy.health -= damage;
            characterStats.health = Math.min(characterStats.maxHealth, characterStats.health + healAmount);
            updatePlayerHealth();
            break;
        // Add other ability effects here
        default:
             appendStory(`\n\nYou attempt to use your ${ability.name} ability.`);
             updateStory();
             return;
    }
    
    // Mark ability as used (simple cooldown for now, needs more robust system)
    ability.usable = false;
    document.querySelector(`.classAbilityBtn[onclick="useClassAbility('${ability.effect}')"]`).disabled = true;

    updateEnemyHealth();
    if (enemy.health <= 0) {
        combatLog.innerHTML += `<div class="combatMessage system">You have defeated the ${enemy.name}!</div>`;
        setTimeout(() => endCombat(true), 1500);
    } else {
        setTimeout(performEnemyAction, 1500);
    }
}

export function restartGame() {
    console.log("Restarting game...");
    location.reload();
}