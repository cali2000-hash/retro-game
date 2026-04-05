// Game Data Store - Fully Verified Library
const GAMES = [
    { id: 'retrojump-2077', title: 'RetroJump 2077', system: 'original', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
    { id: 'neongalaga-2077', title: 'Neon Galaga 2077', system: 'original', image: 'https://images.unsplash.com/photo-1614027164847-1b2809eb1899?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' },
    { id: 'mario1', title: 'Super Mario Bros.', system: 'nes', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/mario1.nes' },
    { id: 'mario2', title: 'Super Mario Bros. 2', system: 'nes', image: 'https://images.unsplash.com/photo-1627063411738-95af79685a97?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/mario2.nes' },
    { id: 'mario3', title: 'Super Mario Bros. 3', system: 'nes', image: 'https://images.unsplash.com/photo-1605897472359-85e4b94d685d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/mario3.nes' },
    { id: 'tetris', title: 'Tetris', system: 'nes', image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/tetris.nes' },
    { id: 'pacman', title: 'Pac-Man', system: 'nes', image: 'https://images.unsplash.com/photo-1579309401359-10701513a672?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/pacman.nes' },
    { id: 'contra', title: 'Contra', system: 'nes', image: 'https://images.unsplash.com/photo-1590492463428-250325d70e4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/contra.nes' },
    { id: 'zelda1', title: 'The Legend of Zelda', system: 'nes', image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/zelda1.nes' },
    { id: 'metroid', title: 'Metroid', system: 'nes', image: 'https://images.unsplash.com/photo-1614027164847-1b2809eb1899?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/metroid.nes' },
    { id: 'megaman', title: 'Mega Man', system: 'nes', image: 'https://images.unsplash.com/photo-1605335198230-07ec8ad64604?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/megaman.nes' },
    { id: 'dkong', title: 'Donkey Kong', system: 'nes', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/dkong.nes' },
    { id: 'smworld', title: 'Super Mario World', system: 'snes', image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/smworld.sfc' },
    { id: 'dkc1', title: 'Donkey Kong Country', system: 'snes', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/dkc1.sfc' },
    { id: 'sf2', title: 'Street Fighter II', system: 'snes', image: 'https://images.unsplash.com/photo-1533236897111-3e94666b2edf?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/sf2.sfc' },
    { id: 'poke-eme', title: 'Pokemon Emerald', system: 'gba', image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/poke-eme.gba' },
    { id: 'sonic1', title: 'Sonic The Hedgehog', system: 'genesis', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80', romUrl: '/roms/sonic1.md' }
];

let currentSystem = 'all';

// Final Initialization Shield
function initApp() {
    console.log('Arcade Engine Starting...');
    renderGames();
    setupEventListeners();
}

function renderGames() {
    const gameGrid = document.getElementById('game-grid');
    if (!gameGrid) {
        console.error('CRITICAL ERROR: game-grid not found!');
        return;
    }
    
    gameGrid.innerHTML = '';
    const filteredGames = currentSystem === 'all' 
        ? GAMES 
        : GAMES.filter(game => game.system === currentSystem);

    filteredGames.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class=\"game-image-wrapper\">
                <img src=\"${game.image}\" alt=\"${game.title}\" class=\"game-image\" loading=\"lazy\">
            </div>
            <div class=\"game-info\">
                <span class=\"game-system\">${game.system}</span>
                <h3 class=\"game-title\">${game.title}</h3>
            </div>
        `;
        card.onclick = () => launchGame(game);
        gameGrid.appendChild(card);
    });
}

function setupEventListeners() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSystem = btn.dataset.system;
            renderGames();
        };
    });

    const closeBtn = document.getElementById('close-emulator');
    if (closeBtn) closeBtn.onclick = () => closeEmulator();
}

function launchGame(game) {
    const container = document.getElementById('emulator-container');
    const title = document.getElementById('current-game-title');
    const display = document.getElementById('emulator');
    
    if (!container || !display) return;

    title.textContent = game.title;
    container.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    display.innerHTML = '';

    if (game.system === 'original') {
        const canvas = document.createElement('canvas');
        canvas.id = 'original-canvas';
        canvas.classList.add('original-game-canvas');
        display.appendChild(canvas);
        
        try {
            if (game.id === 'neongalaga-2077') {
                new NeonGalagaGame('original-canvas').run();
            } else {
                new RetroJumpGame('original-canvas').run();
            }
        } catch(e) {
            console.error('Engine error:', e);
            display.innerHTML = '<div class=\"error\">Failed to start original engine.</div>';
        }
    } else {
        display.innerHTML = '<div style=\"width:100%;height:100%;\" id=\"game\"></div>';
        const cores = { 'nes': 'fceumm', 'snes': 'snes9x', 'gba': 'mgba', 'genesis': 'genesis_plus_gx' };
        
        window.EJS_player = '#game';
        window.EJS_gameUrl = window.location.origin + game.romUrl;
        window.EJS_core = cores[game.system] || game.system;
        window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
        window.EJS_startOnHover = false;
        window.EJS_gameID = game.id;
        window.EJS_buttons = { save: true, load: true, fullScreen: true, volume: true, settings: true };

        const script = document.createElement('script');
        script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
        script.id = 'emulator-script';
        document.body.appendChild(script);
    }
}

function closeEmulator() {
    const container = document.getElementById('emulator-container');
    const display = document.getElementById('emulator');
    if (container) container.classList.add('hidden');
    document.body.style.overflow = 'auto';
    if (display) display.innerHTML = '';
}

// Kickstart
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
