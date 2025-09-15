// js/systems/settings.js
// Manages the display settings panel and applies theme changes.

import { displaySettings } from '../state.js';

// Helper function to convert color values to HEX for the color picker
function toHex(color) {
    if (color.startsWith('#')) return color;
    if (color.startsWith('rgb')) {
        const parts = color.match(/(\d+)/g);
        if (!parts || parts.length < 3) return '#000000';
        return "#" + parts.slice(0, 3).map(part => {
            const hex = parseInt(part).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        }).join('');
    }
    // For named colors, a more complex solution is needed, but this covers rgb/hex.
    return color;
}

function applyDisplaySettings() {
    const gameCtn = document.getElementById('gameCtn');
    const storyCtn = document.getElementById('storyCtn');
    if (!gameCtn || !storyCtn) return;

    // Apply styles
    gameCtn.style.borderColor = displaySettings.borderColor;
    gameCtn.style.backgroundColor = displaySettings.backgroundColor;
    storyCtn.style.color = displaySettings.textColor;
    storyCtn.style.fontFamily = displaySettings.fontFamily;
}

function loadDisplaySettingsToUI() {
    document.getElementById('textColorPicker').value = toHex(displaySettings.textColor);
    document.getElementById('fontSelect').value = displaySettings.fontFamily;
    applyDisplaySettings();
}

export function initSettings() {
    // Make functions available on the window object for HTML onclick attributes
    window.updateDisplaySetting = (setting, value) => {
        displaySettings[setting] = value;
        applyDisplaySettings();
    };
    window.applyPreset = (preset) => {
        switch (preset) {
            case 'classic':
                displaySettings.textColor = "#c7a758";
                displaySettings.fontFamily = "'Crimson Pro', serif";
                displaySettings.backgroundColor = "rgba(20, 15, 8, 0.92)";
                displaySettings.borderColor = "#634d22";
                break;
            case 'dark':
                displaySettings.textColor = "#aaaaaa";
                displaySettings.fontFamily = "'Crimson Pro', serif";
                displaySettings.backgroundColor = "rgba(10, 10, 10, 0.95)";
                displaySettings.borderColor = "#444444";
                break;
            case 'retro':
                displaySettings.textColor = "#33ff33";
                displaySettings.fontFamily = "'Press Start 2P', cursive";
                displaySettings.backgroundColor = "rgba(0, 20, 0, 0.9)";
                displaySettings.borderColor = "#33ff33";
                break;
        }
        loadDisplaySettingsToUI();
    };
    window.saveDisplaySettings = () => {
        try {
            localStorage.setItem('displaySettings', JSON.stringify(displaySettings));
            alert('Display settings saved!');
        } catch (e) {
            console.error("Error saving display settings:", e);
        }
    };
    window.resetDisplaySettings = () => {
        localStorage.removeItem('displaySettings');
        // Reset to default values
        displaySettings.textColor = "#c7a758";
        displaySettings.fontFamily = "'Crimson Pro', serif";
        displaySettings.backgroundColor = "rgba(20, 15, 8, 0.92)";
        displaySettings.borderColor = "#634d22";
        loadDisplaySettingsToUI();
        alert('Display settings reset to default.');
    };

    // Load saved settings on startup
    const savedSettings = localStorage.getItem('displaySettings');
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            Object.assign(displaySettings, parsedSettings);
        } catch (e) {
            console.error("Error loading saved settings:", e);
        }
    }
    loadDisplaySettingsToUI();
}

export function showDisplaySettings() {
    document.getElementById('displaySettingsCtn').style.display = 'block';
}