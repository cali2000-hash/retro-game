// Game Data Store
const GAMES = [
    {
        id: 'super-mario-bros',
        title: 'Super Mario Bros.',
        system: 'nes',
        image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        romUrl: 'https://archive.org/download/super-mario-bros-nes/Super%20Mario%20Bros.%20%28Japan%2C%20USA%29.nes'
    },
    {
        id: 'donkey-kong-country',
        title: 'Donkey Kong Country',
        system: 'snes',
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        romUrl: 'https://archive.org/download/snes_romset_202306/Donkey%20Kong%20Country%20%28USA%29.sfc'
    },
    {
        id: 'pokemon-emerald',
        title: 'Pokemon Emerald',
        system: 'gba',
        image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        romUrl: 'https://archive.org/download/gba-romset-v1/Pokemon%20-%20Emerald%20Version%20%28USA%2C%20Europe%29.gba'
    },
    {
        id: 'sonic-the-hedgehog',
        title: 'Sonic The Hedgehog',
        system: 'genesis',
        image: 'https://images.unsplash.com/photo-1533236897111-3e94666b2edf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        romUrl: 'https://archive.org/download/sega-genesis-romset-v1/Sonic%20The%20Hedgehog%20%28USA%2C%20Europe%29.md'
    },
    {
        id: 'zelda-alink-to-the-past',
        title: 'The Legend of Zelda: A Link to the Past',
        system: 'snes',
        image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        romUrl: 'https://archive.org/download/snes_romset_202306/Legend%20of%20Zelda%2C%20The%20-%20A%20Link%20to%20the%20Past%20%28USA%29.sfc'
    },
    {
        id: 'tetris-gb',
        title: 'Tetris',
        system: 'nes', // Simplified for category
        image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
        romUrl: 'https://archive.org/download/super-mario-bros-nes/Tetris%20%28USA%29.nes'
    }
];

// App State
let currentSystem = 'all';

// DOM Elements
const gameGrid = document.getElementById('game-grid');
const emulatorContainer = document.getElementById('emulator-container');
const closeEmulatorBtn = document.getElementById('close-emulator');
const currentGameTitle = document.getElementById('current-game-title');
const emulatorDiv = document.getElementById('emulator');
const tabBtns = document.querySelectorAll('.tab-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    renderGames();
    setupEventListeners();
}

function renderGames() {
    gameGrid.innerHTML = '';
    
    const filteredGames = currentSystem === 'all' 
        ? GAMES 
        : GAMES.filter(game => game.system === currentSystem);

    if (filteredGames.length === 0) {
        gameGrid.innerHTML = '<div class="no-games">No games found in this category.</div>';
        return;
    }

    filteredGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-image-wrapper">
                <img src="${game.image}" alt="${game.title}" class="game-image" loading="lazy">
            </div>
            <div class="game-info">
                <span class="game-system">${game.system}</span>
                <h3 class="game-title">${game.title}</h3>
            </div>
        `;
        card.addEventListener('click', () => launchGame(game));
        gameGrid.appendChild(card);
    });
}

function setupEventListeners() {
    // Navigation Tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSystem = btn.dataset.system;
            renderGames();
        });
    });

    // Close Emulator
    closeEmulatorBtn.addEventListener('click', () => {
        closeEmulator();
    });

    // Handle Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !emulatorContainer.classList.contains('hidden')) {
            closeEmulator();
        }
    });
}

function launchGame(game) {
    currentGameTitle.textContent = game.title;
    emulatorContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Clear previous script and instances
    const oldScript = document.getElementById('emulator-script');
    if (oldScript) oldScript.remove();
    emulatorDiv.innerHTML = '<div style=\"width:100%;height:100%;\" id=\"game\"></div>';

    // Core Mapping
    const cores = {
        'nes': 'fceumm',
        'snes': 'snes9x',
        'gba': 'mgba',
        'genesis': 'genesis_plus_gx'
    };

    // EmulatorJS Configuration (Using stable official CDN)
    window.EJS_player = '#game';
    window.EJS_gameUrl = game.romUrl;
    window.EJS_core = cores[game.system] || game.system;
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnHover = false;
    window.EJS_language = 'en-US';
    window.EJS_buttons = {
        save: true,
        load: true,
        fullScreen: true,
        screenshot: true,
        volume: true,
        settings: true
    };

    // Load EmulatorJS Loader Script (From stable official CDN)
    const script = document.createElement('script');
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.id = 'emulator-script';
    document.body.appendChild(script);

    console.log(`Launching ${game.title} with core ${window.EJS_core} from stable CDN...`);
}

function closeEmulator() {
    emulatorContainer.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Stop the emulator by completely clearing the div and script
    emulatorDiv.innerHTML = '';
    const script = document.getElementById('emulator-script');
    if (script) script.remove();

    // Clean up EJS global variables
    delete window.EJS_player;
    delete window.EJS_gameUrl;
    delete window.EJS_core;
    delete window.EJS_pathtodata;
    delete window.EJS_startOnHover;
    delete window.EJS_buttons;
    
    // Attempt to call any internal cleanup if exists
    if (window.EJS_instance) {
        // Some versions use instance cleanup
    }
}
