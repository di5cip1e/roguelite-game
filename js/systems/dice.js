// js/systems/dice.js
// Manages the 3D dice rolling interface and logic.

import { diceTypes } from '../data.js';
import { story, gameState, setDiceValue, diceCount, diceModifier, currentDiceType } from '../state.js'; // CORRECTED IMPORT
import { updateStory, appendStory } from '../ui.js';
import { generateChoices } from './game-loop.js';

export function initDiceSystem() {
    setupDiceButtons();
    updateDiceTray();
    updateDiceInfo(currentDiceType);

    document.getElementById('diceCount').addEventListener('change', function() {
        // In a real app, you'd call setDiceCount(this.value) here
        window.diceCount = parseInt(this.value) || 1;
        updateDiceTray();
    });

    document.getElementById('diceModifier').addEventListener('change', function() {
        // In a real app, you'd call setDiceModifier(this.value) here
        window.diceModifier = parseInt(this.value) || 0;
    });
}

function setupDiceButtons() {
    const diceButtons = document.querySelectorAll('.dice-btn');
    diceButtons.forEach(button => {
        button.addEventListener('click', function() {
            diceButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            window.currentDiceType = this.getAttribute('data-dice'); // Use window for now
            document.getElementById('diceType').textContent = window.currentDiceType;
            updateDiceTray();
            updateDiceInfo(window.currentDiceType);
        });
    });
    document.querySelector('.dice-btn[data-dice="d20"]').classList.add('active');
}

function updateDiceTray() {
    const diceTray = document.getElementById('diceTray');
    diceTray.innerHTML = '';
    const count = window.diceCount || 1;
    const type = window.currentDiceType || 'd20';
    
    if (type === 'd100') {
        const percentileContainer = document.createElement('div');
        percentileContainer.className = 'percentile';
        percentileContainer.appendChild(createDiceElement('d10', 0, true));
        percentileContainer.appendChild(createDiceElement('d10', 1));
        diceTray.appendChild(percentileContainer);
    } else {
        for (let i = 0; i < count; i++) {
            diceTray.appendChild(createDiceElement(type, i));
        }
    }
}

function createDiceElement(diceType, index, isTens = false) {
    const dice = document.createElement('div');
    dice.className = `dice ${diceType}`;
    dice.id = `${diceType}_${index}`;
    if (isTens) dice.dataset.tens = 'true';

    const diceInner = document.createElement('div');
    diceInner.className = 'dice-inner';

    const faces = diceTypes[diceType].sides;
    const faceType = diceType === 'd6' ? 'div' : 'div'; // Simplified
    const numberClass = `${diceType}-number`;

    // Simplified face creation
    for (let i = 1; i <= faces; i++) {
        const face = document.createElement('div');
        face.className = `${diceType}-face`;
        const number = document.createElement('div');
        number.className = numberClass;
        number.textContent = i;
        face.appendChild(number);
        diceInner.appendChild(face);
    }
    dice.appendChild(diceInner);
    return dice;
}


function updateDiceInfo(diceType) {
    const info = diceTypes[diceType];
    const descriptionEl = document.getElementById('diceDescription');
    if (descriptionEl) {
        descriptionEl.innerHTML = `The <strong>${info.name} (${diceType})</strong> is used for: ${info.uses}.`;
    }
}

export function rollTheBones() {
    const diceTray = document.getElementById('diceTray');
    const diceResult = document.getElementById('diceResult');
    let results = [];
    
    document.getElementById('diceSection').classList.add('active');
    diceResult.textContent = "Rolling...";

    const diceElements = diceTray.querySelectorAll('.dice');
    diceElements.forEach(die => die.classList.add('rolling'));

    setTimeout(() => {
        diceElements.forEach(die => die.classList.remove('rolling'));

        const type = window.currentDiceType || 'd20';
        const count = window.diceCount || 1;
        const modifier = window.diceModifier || 0;

        if (type === 'd100') {
            const tensValue = Math.floor(Math.random() * 10) * 10;
            const onesValue = Math.floor(Math.random() * 10);
            let result = tensValue + onesValue;
            if (result === 0) result = 100;
            results.push(result);
        } else {
            const sides = diceTypes[type].sides;
            for (let i = 0; i < count; i++) {
                results.push(Math.floor(Math.random() * sides) + 1);
            }
        }
        
        const total = results.reduce((sum, val) => sum + val, 0) + modifier;
        
        let resultText = results.join(' + ');
        if (count > 1 || modifier !== 0) {
             if (modifier > 0) resultText += ` + ${modifier}`;
             if (modifier < 0) resultText += ` - ${Math.abs(modifier)}`;
             resultText += ` = ${total}`;
        } else {
            resultText = total.toString();
        }
        diceResult.textContent = resultText;
        
        setDiceValue(total);
        document.getElementById('continueBtn').hidden = false;

    }, 1200);
}

export function continueAfterRoll() {
    document.getElementById('diceSection').classList.remove('active');
    document.getElementById('continueBtn').hidden = true;
    gameState.needsDiceRoll = false;

    appendStory(`\n\nYou rolled a ${diceValue}!`);
    if (diceValue >= 15) {
        appendStory(" A resounding success!");
    } else if (diceValue >= 10) {
        appendStory(" A moderate success.");
    } else {
        appendStory(" The outcome is less than ideal...");
    }
    
    updateStory();
    generateChoices();
}