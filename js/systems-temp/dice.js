// js/systems/dice.js
// Manages the 3D dice rolling interface and logic.

import { diceTypes } from '../data.js';
import { story, gameState } from '../state.js';
// We will create these setter functions when we revise the state.js file.
// For now, this code assumes they exist to properly manage state across modules.
import {
    setCurrentDiceType, setDiceCount, setDiceModifier,
    setDiceResults, setDiceTotal, setDiceValue
} from '../state-setters.js'; // This will be our new way to manage state
import { updateStory } from '../ui.js';
import { generateChoices } from './game-loop.js';

let currentDiceType = 'd20';
let diceCount = 1;
let diceModifier = 0;

export function initDiceSystem() {
    setupDiceButtons();
    updateDiceTray();
    updateDiceInfo(currentDiceType);

    document.getElementById('diceCount').addEventListener('change', function() {
        diceCount = parseInt(this.value) || 1;
        updateDiceTray();
    });

    document.getElementById('diceModifier').addEventListener('change', function() {
        diceModifier = parseInt(this.value) || 0;
    });
}

function setupDiceButtons() {
    const diceButtons = document.querySelectorAll('.dice-btn');
    diceButtons.forEach(button => {
        button.addEventListener('click', function() {
            diceButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentDiceType = this.getAttribute('data-dice');
            document.getElementById('diceType').textContent = currentDiceType;
            updateDiceTray();
            updateDiceInfo(currentDiceType);
        });
    });
    document.querySelector('.dice-btn[data-dice="d20"]').classList.add('active');
}

function updateDiceTray() {
    const diceTray = document.getElementById('diceTray');
    diceTray.innerHTML = '';
    
    if (currentDiceType === 'd100') {
        const percentileContainer = document.createElement('div');
        percentileContainer.className = 'percentile';
        percentileContainer.appendChild(createDiceElement('d10', 0, true)); // Tens die
        percentileContainer.appendChild(createDiceElement('d10', 1));      // Ones die
        diceTray.appendChild(percentileContainer);
    } else {
        for (let i = 0; i < diceCount; i++) {
            diceTray.appendChild(createDiceElement(currentDiceType, i));
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

    // Simplified face creation for brevity
    const faces = diceTypes[diceType].sides;
    for (let i = 1; i <= faces; i++) {
        const face = document.createElement('div');
        face.className = `${diceType}-face`;
        const number = document.createElement('div');
        number.className = `${diceType}-number`;
        number.textContent = i;
        face.appendChild(number);
        diceInner.appendChild(face);
    }
    dice.appendChild(diceInner);
    return dice;
}

function updateDiceInfo(diceType) {
    const info = diceTypes[diceType];
    document.getElementById('diceDescription').innerHTML = `The <strong>${info.name} (${diceType})</strong> is used for: ${info.uses}.`;
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

        if (currentDiceType === 'd100') {
            const tensValue = Math.floor(Math.random() * 10) * 10;
            const onesValue = Math.floor(Math.random() * 10);
            let result = tensValue + onesValue;
            if (result === 0) result = 100;
            results.push(result);
        } else {
            const sides = diceTypes[currentDiceType].sides;
            for (let i = 0; i < diceCount; i++) {
                results.push(Math.floor(Math.random() * sides) + 1);
            }
        }
        
        const total = results.reduce((sum, val) => sum + val, 0) + diceModifier;
        
        let resultText = results.join(' + ');
        if (diceCount > 1 || diceModifier !== 0) {
             if (diceModifier > 0) resultText += ` + ${diceModifier}`;
             if (diceModifier < 0) resultText += ` - ${Math.abs(diceModifier)}`;
             resultText += ` = ${total}`;
        } else {
            resultText = total;
        }
        diceResult.textContent = resultText;
        
        window.diceValue = total; // Set global diceValue for legacy access
        document.getElementById('continueBtn').hidden = false;

    }, 1200);
}

export function continueAfterRoll() {
    document.getElementById('diceSection').classList.remove('active');
    document.getElementById('continueBtn').hidden = true;
    gameState.needsDiceRoll = false;

    story += `\n\nYou rolled a ${window.diceValue}!`;
    if (window.diceValue >= 15) {
        story += " A resounding success!";
    } else if (window.diceValue >= 10) {
        story += " A moderate success.";
    } else {
        story += " The outcome is less than ideal...";
    }
    
    updateStory();
    generateChoices();
}