// js/systems/map.js
// Manages the world map, procedural generation, and travel between locations.

import { mapSystem, story, appendStory } from '../state.js';
import { updateStory, speakText } from '../ui.js';
import { generateText, generateImage } from './ai.js';
import { generateTravelEvents } from './events.js';

export function initMapSystem() {
    mapSystem.canvas = document.getElementById('mapCanvas');
    if (mapSystem.canvas) {
        mapSystem.ctx = mapSystem.canvas.getContext('2d');
        createMapBackground();
    } else {
        console.error("Map canvas not found!");
    }
}

async function createMapBackground() {
    try {
        const mapPrompt = "Aged parchment map background, vintage, fantasy world, subtle details like a compass rose and sea monsters, top-down view.";
        const imageUrl = await generateImage(mapPrompt);
        mapSystem.mapImage = new Image();
        mapSystem.mapImage.onload = () => drawMap();
        mapSystem.mapImage.onerror = () => {
            drawFallbackBackground();
            drawMap();
        };
        mapSystem.mapImage.src = imageUrl;
    } catch (error) {
        console.error("Failed to generate map background:", error);
        drawFallbackBackground();
        drawMap();
    }
}

export async function generateWorldMap() {
    if (!mapSystem.canvas || !mapSystem.ctx) return;

    const locationTypes = [
        { type: "village", name: "Village", color: "#7d4f1a" },
        { type: "forest", name: "Forest", color: "#215c30" },
        { type: "mountain", name: "Mountain", color: "#616161" },
        { type: "dungeon", name: "Dungeon", color: "#420d0d" },
        { type: "ruins", name: "Ruins", color: "#757128" },
        { type: "city", name: "City", color: "#38507a" },
        { type: "swamp", name: "Swamp", color: "#3c5142" }
    ];
    const locationCount = 8 + Math.floor(Math.random() * 5);
    const margin = 50;

    mapSystem.locations = {};
    mapSystem.paths = [];

    try {
        const locationNamesText = await generateText(`Generate ${locationCount} unique fantasy location names (1-2 words each) for a game map, one per line.`);
        const nameList = locationNamesText.split('\n').map(n => n.trim()).filter(Boolean);

        let positions = [];
        let locationIds = [];

        for (let i = 0; i < locationCount; i++) {
            let locType = locationTypes[Math.floor(Math.random() * locationTypes.length)];
            let name = nameList[i] || `${locType.name} ${i + 1}`;
            
            let x, y, tooClose;
            let attempts = 0;
            const minDistance = 80;
            do {
                tooClose = false;
                x = margin + Math.random() * (mapSystem.canvas.width - 2 * margin);
                y = margin + Math.random() * (mapSystem.canvas.height - 2 * margin);
                for (let pos of positions) {
                    const d = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
                    if (d < minDistance) {
                        tooClose = true;
                        break;
                    }
                }
                attempts++;
            } while (tooClose && attempts < 100);
            positions.push({ x, y });

            const locId = `loc_${i}`;
            locationIds.push(locId);
            mapSystem.locations[locId] = {
                id: locId, name, type: locType.type, typeName: locType.name,
                x, y, color: locType.color, dangerLevel: 1 + Math.floor(Math.random() * 4),
                description: `An uncharted ${locType.name}.`, connectedTo: [], visited: false, imageUrl: null
            };
        }

        // Create paths and ensure a connected graph (simplified logic)
        locationIds.forEach(locId => {
            const loc = mapSystem.locations[locId];
            const otherLocs = locationIds
              .filter(id => id !== locId)
              .sort((a, b) => {
                const distA = Math.hypot(mapSystem.locations[a].x - loc.x, mapSystem.locations[a].y - loc.y);
                const distB = Math.hypot(mapSystem.locations[b].x - loc.x, mapSystem.locations[b].y - loc.y);
                return distA - distB;
              });

            const connections = 1 + Math.floor(Math.random() * 2);
            for(let i = 0; i < connections && i < otherLocs.length; i++) {
                const otherId = otherLocs[i];
                if (!loc.connectedTo.includes(otherId) && !mapSystem.locations[otherId].connectedTo.includes(locId)) {
                    loc.connectedTo.push(otherId);
                    mapSystem.locations[otherId].connectedTo.push(locId);
                    mapSystem.paths.push({ from: locId, to: otherId });
                }
            }
        });


        const startingLocId = locationIds[0];
        mapSystem.locations[startingLocId].visited = true;
        mapSystem.currentLocation = startingLocId;
        
        drawMap();
        updateLocationInfo();
        mapSystem.initialized = true;

    } catch (error) {
        console.error("Failed to generate world map:", error);
    }
}

function drawMap() {
    if (!mapSystem.ctx) return;
    mapSystem.ctx.clearRect(0, 0, mapSystem.canvas.width, mapSystem.canvas.height);
    if (mapSystem.mapImage && mapSystem.mapImage.complete) {
        mapSystem.ctx.drawImage(mapSystem.mapImage, 0, 0, mapSystem.canvas.width, mapSystem.canvas.height);
    } else {
        drawFallbackBackground();
    }
    drawMapContent();
}

function drawFallbackBackground() {
    if (!mapSystem.ctx) return;
    mapSystem.ctx.fillStyle = '#e0d8b0';
    mapSystem.ctx.fillRect(0, 0, mapSystem.canvas.width, mapSystem.canvas.height);
}

function drawMapContent() {
    if (!mapSystem.ctx) return;
    const ctx = mapSystem.ctx;
    
    // Draw paths
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    mapSystem.paths.forEach(path => {
        const from = mapSystem.locations[path.from];
        const to = mapSystem.locations[path.to];
        if (from && to) {
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
    });

    if (mapSystem.selectedPath) {
        const from = mapSystem.locations[mapSystem.currentLocation];
        const to = mapSystem.locations[mapSystem.selectedPath];
        if(from && to) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#ff4081';
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
    }

    // Draw locations
    for (const locId in mapSystem.locations) {
        const loc = mapSystem.locations[locId];
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = loc.visited ? '#c7a758' : '#634d22';
        ctx.fill();
        ctx.strokeStyle = locId === mapSystem.currentLocation ? '#ff4081' : '#111';
        ctx.lineWidth = locId === mapSystem.currentLocation ? 3 : 2;
        ctx.stroke();
    }
}

function updateLocationInfo() {
    if (!mapSystem.currentLocation) return;
    const location = mapSystem.locations[mapSystem.currentLocation];
    if (!location) return;

    document.getElementById('locationName').textContent = location.name;
    document.getElementById('locationDesc').textContent = location.description;
    
    const pathOptions = document.getElementById('pathOptions');
    pathOptions.innerHTML = '';
    location.connectedTo.forEach(connectedId => {
        const connectedLoc = mapSystem.locations[connectedId];
        if (connectedLoc) {
            const isSelected = connectedId === mapSystem.selectedPath;
            const pathBtn = document.createElement('button');
            pathBtn.className = `pathBtn ${isSelected ? 'active' : ''}`;
            pathBtn.textContent = connectedLoc.name;
            pathBtn.onclick = () => selectPath(connectedId);
            pathOptions.appendChild(pathBtn);
        }
    });
    
    document.getElementById('travelBtn').disabled = !mapSystem.selectedPath;
}

export function selectPath(locationId) {
    mapSystem.selectedPath = locationId;
    drawMap();
    updateLocationInfo();
}

export async function travelToLocation() {
    if (!mapSystem.selectedPath) return;
    
    const fromLoc = mapSystem.locations[mapSystem.currentLocation];
    const toLoc = mapSystem.locations[mapSystem.selectedPath];

    const travelNarrative = await generateText(`Write a brief paragraph about traveling from ${fromLoc.name} to ${toLoc.name}.`);
    appendStory(`\n\n${travelNarrative}`);
    updateStory();
    speakText(travelNarrative);
    
    mapSystem.currentLocation = mapSystem.selectedPath;
    mapSystem.locations[mapSystem.currentLocation].visited = true;
    mapSystem.selectedPath = null;
    
    drawMap();
    updateLocationInfo();
    
    await generateTravelEvents(fromLoc.dangerLevel); 
}