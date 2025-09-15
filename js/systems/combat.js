// js/systems/combat.js
// Handles all logic related to combat encounters.

import { gameState, combatSystem, characterStats, userProfile, story, appendStory } from '../state.js';
import { enemyTemplates, difficultySettings } from '../data.js';
import { updateStory, updateCombatVisibility, updateStatsDisplay, speakText, generateStoryImage } from '../ui.js';
import { generateText } from './ai.js';
import { generateChoices } from './game-loop.js';
import { gainExperience } from './character.js';


export function initCombat() {
    // This function can be used to set up initial combat-related event listeners if needed in the future.
    console.log("Combat system initialized.");
}

export async function generateCombatEvent(dangerLevel) {
    gameState.combatActive = true;
    updateCombatVisibility();

    const enemyOptions = Object.keys(enemyTemplates).filter(key => {
        const enemyDanger = Math.ceil(enemyTemplates[key].maxHealth / 20);
        return enemyDanger <= dangerLevel;
    });

    const enemyType = enemyOptions.length > 0
        ? enemyOptions[Math.floor(Math.random() * enemyOptions.length)]
        : Object.keys(enemyTemplates)[Math.floor(Math.random() * Object.keys(enemyTemplates).length)];

    const enemyTemplate = enemyTemplates[enemyType];
    const enemy = { ...enemyTemplate };

    const diffMod = difficultySettings[userProfile.difficulty];
    enemy.health = Math.floor(enemy.health / (diffMod.healthMod || 1));
    enemy.maxHealth = enemy.health;
    enemy.damage = Math.floor(enemy.damage * diffMod.damageReceived);

    combatSystem.currentEnemy = enemy;
    combatSystem.inCombat = true;
    combatSystem.turnCount = 0;
    combatSystem.playerDefending = false;
    combatSystem.enemyDefending = false;
    combatSystem.playerEffects = [];
    combatSystem.enemyEffects = [];

    document.getElementById('enemyName').textContent = enemy.name;
    updateEnemyHealth();
    updatePlayerHealth();

    const combatNarrative = await generateText(`
        Write a brief, tense paragraph (3-4 sentences) about the player encountering a ${enemy.name.toLowerCase()} while traveling.
        Describe the ${enemy.name.toLowerCase()}'s appearance and initial threatening behavior.
        Make it atmospheric and evocative. Use short, punchy sentences for dramatic effect.
    `);

    appendStory(`\n\n${combatNarrative}`);
    updateStory();
    speakText(combatNarrative);

    generateStoryImage(enemy.imagePrompt || `Fantasy ${enemy.name}, menacing, game art style`);

    const combatLog = document.getElementById('combatLog');
    combatLog.innerHTML = `<div class="combatMessage system">Combat has begun against a ${enemy.name}! Choose your action...</div>`;
}

export function performCombatAction(action) {
    if (!combatSystem.inCombat || !combatSystem.currentEnemy) return;

    const combatLog = document.getElementById('combatLog');
    let damage = 0;

    switch (action) {
        case 'attack':
            damage = Math.floor(characterStats.strength * 0.5) + Math.floor(Math.random() * 10) + 1;
            if (combatSystem.enemyDefending) {
                damage = Math.floor(damage * 0.5);
                combatLog.innerHTML += `<div class="combatMessage player">You attack the defending ${combatSystem.currentEnemy.name} for <span class="damage">${damage}</span> damage!</div>`;
                combatSystem.enemyDefending = false;
            } else {
                combatLog.innerHTML += `<div class="combatMessage player">You attack the ${combatSystem.currentEnemy.name} for <span class="damage">${damage}</span> damage!</div>`;
            }
            combatSystem.currentEnemy.health -= damage;
            break;

        case 'defend':
            combatSystem.playerDefending = true;
            combatLog.innerHTML += `<div class="combatMessage player">You take a defensive stance, reducing incoming damage.</div>`;
            break;

        case 'special':
            damage = Math.floor(characterStats.intelligence * 1.2) + Math.floor(Math.random() * 12) + 5;
            combatLog.innerHTML += `<div class="combatMessage player">You unleash a special ability for <span class="damage critical">${damage}</span> damage!</div>`;
            combatSystem.currentEnemy.health -= damage;
            break;

        case 'item':
            const healingAmount = 20;
            characterStats.health = Math.min(characterStats.maxHealth, characterStats.health + healingAmount);
            combatLog.innerHTML += `<div class="combatMessage player">You use a healing potion, restoring <span class="healing">${healingAmount}</span> health!</div>`;
            updatePlayerHealth();
            break;
    }

    updateEnemyHealth();

    if (combatSystem.currentEnemy.health <= 0) {
        combatLog.innerHTML += `<div class="combatMessage system">You have defeated the ${combatSystem.currentEnemy.name}!</div>`;
        gainExperience(30);
        setTimeout(() => endCombat(true), 1500);
        return;
    }

    setTimeout(performEnemyAction, 1500);
}

export function performEnemyAction() {
    if (!combatSystem.inCombat || !combatSystem.currentEnemy) return;

    const enemy = combatSystem.currentEnemy;
    const combatLog = document.getElementById('combatLog');
    let action = 'attack';

    if (enemy.health < enemy.maxHealth * 0.3 && Math.random() < 0.3) {
        action = 'defend';
    } else if (Math.random() < 0.25) {
        action = 'special';
    }

    switch (action) {
        case 'attack':
            let damage = enemy.damage + Math.floor(Math.random() * 5);
            if (combatSystem.playerDefending) {
                damage = Math.floor(damage * 0.5);
                combatLog.innerHTML += `<div class="combatMessage enemy">The ${enemy.name} attacks, but your defense reduces the damage to <span class="damage">${damage}</span>!</div>`;
                combatSystem.playerDefending = false;
            } else {
                combatLog.innerHTML += `<div class="combatMessage enemy">The ${enemy.name} attacks you for <span class="damage">${damage}</span> damage!</div>`;
            }
            characterStats.health -= damage;
            break;

        case 'defend':
            combatSystem.enemyDefending = true;
            combatLog.innerHTML += `<div class="combatMessage enemy">The ${enemy.name} takes a defensive stance.</div>`;
            break;

        case 'special':
            const specialDamage = Math.floor(enemy.damage * 1.5) + Math.floor(Math.random() * 6);
            combatLog.innerHTML += `<div class="combatMessage enemy">The ${enemy.name} uses ${enemy.special}, dealing <span class="damage critical">${specialDamage}</span> damage!</div>`;
            characterStats.health -= specialDamage;
            break;
    }

    updatePlayerHealth();
    combatLog.scrollTop = combatLog.scrollHeight;

    if (characterStats.health <= 0) {
        combatLog.innerHTML += `<div class="combatMessage system">You have been defeated!</div>`;
        setTimeout(() => endCombat(false), 1500);
    }
}

export function endCombat(victory) {
    gameState.combatActive = false;
    combatSystem.inCombat = false;
    combatSystem.currentEnemy = null;
    updateCombatVisibility();

    if (victory) {
        appendStory("\n\nYou emerge victorious from the fray!");
        updateStory();
        generateChoices();
    } else {
        document.getElementById('deathScreenModal').classList.add('active');
    }
}

export function updatePlayerHealth() {
    if (characterStats.health < 0) characterStats.health = 0;
    document.getElementById('playerHealthText').textContent = `${characterStats.health}/${characterStats.maxHealth}`;
    document.getElementById('playerHealthFill').style.width = `${(characterStats.health / characterStats.maxHealth) * 100}%`;
    updateStatsDisplay();
}

export function updateEnemyHealth() {
    const enemy = combatSystem.currentEnemy;
    if (!enemy) return;
    if (enemy.health < 0) enemy.health = 0;
    document.getElementById('enemyHealthText').textContent = `${enemy.health}/${enemy.maxHealth}`;
    document.getElementById('enemyHealthFill').style.width = `${(enemy.health / enemy.maxHealth) * 100}%`;
}