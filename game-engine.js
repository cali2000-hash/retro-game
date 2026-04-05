/**
 * RetroJump 2077: Final Polish
 * Added parallax neon city background layers.
 */

class RetroJumpGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 400;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.gameState = 'start';
        this.score = 0;
        this.highScore = localStorage.getItem('retrojump-highscore') || 0;
        
        this.level = 1;
        this.levelTargets = [10, 30, 60, 100, 999];
        this.levelThemes = [
            { main: '#00f2ff', bg: '#050510', speed: 6 }, // Level 1
            { main: '#ff00ff', bg: '#100510', speed: 8 }, // Level 2
            { main: '#ffff00', bg: '#101005', speed: 10 }, // Level 3
            { main: '#00ff00', bg: '#051005', speed: 12 }, // Level 4
        ];

        this.player = {
            x: 100, y: 310, width: 40, height: 40, dy: 0,
            jumpForce: 15, gravity: 0.8, isJumping: false, frame: 0
        };

        this.obstacles = [];
        this.collectibles = [];
        this.popups = [];
        
        // Background elements (static but drawn with parallax)
        this.clouds = [];
        for(let i=0; i<5; i++) this.clouds.push({x: Math.random()*800, y: 50+Math.random()*100, w: 100+Math.random()*100});
        
        this.buildings = [];
        for(let i=0; i<10; i++) {
            this.buildings.push({
                x: i * 150,
                w: 80 + Math.random() * 70,
                h: 150 + Math.random() * 150,
                offset: Math.random() * 10
            });
        }

        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        this.setupControls();
    }

    setupControls() {
        const handleEvent = (e) => {
            if (this.gameState === 'level-clear') return;
            this.handleAction();
        };
        window.addEventListener('keydown', (e) => { if (e.code === 'Space') handleEvent(); });
        this.canvas.addEventListener('mousedown', handleEvent);
        this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleEvent(); });
    }

    handleAction() {
        if (this.gameState === 'start' || this.gameState === 'gameover') {
            this.reset(1);
        } else if (this.gameState === 'playing' && !this.player.isJumping) {
            this.player.dy = -this.player.jumpForce;
            this.player.isJumping = true;
            if(window.SoundEngine) SoundEngine.playJump();
        }
    }

    reset(level = 1) {
        this.gameState = 'playing';
        this.level = level;
        this.score = 0;
        this.obstacles = [];
        this.collectibles = [];
        this.popups = [];
        this.player.y = 310;
        this.player.dy = 0;
        this.player.isJumping = false;
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
    }

    nextLevel() {
        this.gameState = 'level-clear';
        setTimeout(() => {
            if (this.level < this.levelThemes.length) {
                this.level++;
                this.reset(this.level);
            } else {
                this.gameState = 'playing';
            }
        }, 2000);
    }

    update() {
        if (this.gameState !== 'playing') return;

        const theme = this.levelThemes[this.level - 1] || this.levelThemes[0];
        const speed = theme.speed;

        this.player.dy += this.player.gravity;
        this.player.y += this.player.dy;
        this.player.frame += 0.2;

        if (this.player.y > 310) {
            this.player.y = 310;
            this.player.dy = 0;
            this.player.isJumping = false;
        }

        this.obstacleTimer++;
        const spawnRate = Math.max(40, 80 - (this.level * 5));
        if (this.obstacleTimer > spawnRate + Math.random() * 50) {
            this.obstacles.push({ x: this.width, y: 310, width: 30, height: 40, color: theme.main });
            this.obstacleTimer = 0;
        }

        this.collectibleTimer++;
        if (this.collectibleTimer > 150 + Math.random() * 150) {
            this.collectibles.push({ x: this.width, y: 150 + Math.random()*100, width: 25, height: 25, color: '#ffff00', rotation: 0 });
            this.collectibleTimer = 0;
        }

        // Update Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= speed;
            if (this.checkCollision(this.player, obs, 10)) this.gameOver();
            if (obs.x + obs.width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                if (this.score >= this.levelTargets[this.level - 1]) this.nextLevel();
            }
        }

        // Update Collectibles
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const item = this.collectibles[i];
            item.x -= speed;
            item.rotation += 0.1;
            if (this.checkCollision(this.player, item, 0)) {
                this.collectibles.splice(i, 1);
                this.score += 5;
                if(window.SoundEngine) SoundEngine.playBonus();
                this.addPopup('BONUS +5', this.player.x, this.player.y);
                if (this.score >= this.levelTargets[this.level - 1]) this.nextLevel();
            }
            if (item.x + item.width < 0) this.collectibles.splice(i, 1);
        }

        // Update Popups
        for (let i = this.popups.length - 1; i >= 0; i--) {
            const p = this.popups[i]; p.y -= 2; p.life--;
            if (p.life <= 0) this.popups.splice(i, 1);
        }
    }

    checkCollision(rect1, rect2, padding) {
        return (rect1.x + padding < rect2.x + rect2.width &&
                rect1.x + rect1.width - padding > rect2.x &&
                rect1.y + padding < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y);
    }

    addPopup(text, x, y) {
        this.popups.push({ text, x, y, life: 40 });
    }

    gameOver() {
        this.gameState = 'gameover';
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('retrojump-highscore', this.highScore);
        }
    }

    draw() {
        const ctx = this.ctx;
        const theme = this.levelThemes[this.level - 1] || this.levelThemes[0];
        
        // Background Base
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, this.width, this.height);

        // Parallax Layer 1: Distant Stars
        this.drawParallaxStars();

        // Parallax Layer 2: Neon Skyline
        this.drawSkyline(theme.main);

        // Ground
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 350, this.width, 50);
        ctx.strokeStyle = theme.main;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 350); ctx.lineTo(this.width, 350); ctx.stroke();

        this.drawPlayer(theme.main);
        
        // Items
        this.obstacles.forEach(obs => {
            ctx.save(); ctx.shadowBlur = 15; ctx.shadowColor = obs.color; ctx.fillStyle = obs.color;
            ctx.translate(obs.x + 15, obs.y + 20); ctx.rotate(Date.now() / 200);
            ctx.fillRect(-15, -15, 30, 30); ctx.rotate(Math.PI / 4); ctx.fillRect(-15, -15, 30, 30);
            ctx.restore();
        });
        this.collectibles.forEach(item => {
            ctx.save(); ctx.translate(item.x + 12, item.y + 12); ctx.rotate(item.rotation);
            ctx.shadowBlur = 15; ctx.shadowColor = item.color; ctx.fillStyle = item.color;
            ctx.fillRect(-8, -12, 16, 24); ctx.fillStyle = '#fff'; ctx.fillRect(-4, -14, 8, 4);
            ctx.restore();
        });

        this.popups.forEach(p => {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.life / 40})`;
            ctx.font = 'bold 20px "Orbitron"';
            ctx.fillText(p.text, p.x, p.y);
        });

        this.drawUI(theme.main);

        if (this.gameState === 'start') {
            this.drawOverlay('CYBER RUNNER 2077', 'MISSION: REACH LEVEL 5', theme.main);
        } else if (this.gameState === 'gameover') {
            this.drawOverlay('MISSION FAILED', `FINAL SCORE: ${this.score}`, '#ff0000');
        } else if (this.gameState === 'level-clear') {
            this.drawOverlay(`LEVEL ${this.level} CLEAR!`, 'PREPARING NEXT MISSION...', '#00ff00');
        }
        this.drawScanlines();
    }

    drawSkyline(color) {
        const ctx = this.ctx;
        const speed = (this.levelThemes[this.level-1].speed || 6) * 0.3; // Parallax slow
        const time = Date.now() / 10 * speed;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.strokeStyle = color + '44'; // Faded neon
        ctx.lineWidth = 1;

        this.buildings.forEach((b, i) => {
            const x = (b.x - (time % 1600) + 1600) % 1600 - 400;
            // Draw Silhouette
            ctx.fillRect(x, this.height - b.h - 50, b.w, b.h);
            ctx.strokeRect(x, this.height - b.h - 50, b.w, b.h);
            
            // Neon Windows
            ctx.fillStyle = color + '22';
            for(let row=0; row<b.h/40; row++) {
                for(let col=0; col<b.w/20; col++) {
                    if((i + row + col) % 3 === 0) {
                        ctx.fillRect(x + 10 + col*20, this.height - b.h - 40 + row*40, 10, 10);
                    }
                }
            }
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        });
    }

    drawParallaxStars() {
        const ctx = this.ctx;
        const time = Date.now() / 20;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for(let i=0; i<40; i++) {
            const x = (i * 200 - time * (0.2 + i%3*0.1)) % this.width;
            const y = (i * 37) % 250;
            ctx.fillRect(x < 0 ? x + this.width : x, y, 2, 2);
        }
    }

    drawPlayer(color) {
        const ctx = this.ctx; const p = this.player;
        const jumpOffset = Math.sin(p.frame) * 2;
        ctx.save();
        ctx.translate(p.x, p.y + (p.isJumping ? 0 : jumpOffset));
        ctx.shadowBlur = 15; ctx.shadowColor = color; ctx.fillStyle = color;
        ctx.fillRect(5, 10, 30, 25);
        ctx.fillRect(0, 5, 8, 8); ctx.fillRect(32, 5, 8, 8);
        ctx.fillStyle = '#000'; ctx.fillRect(8, 15, 6, 6); ctx.fillRect(26, 15, 6, 6);
        ctx.restore();
    }

    drawUI(color) {
        const ctx = this.ctx; ctx.fillStyle = color; ctx.font = 'bold 18px "Orbitron"';
        ctx.textAlign = 'left'; ctx.fillText(`LEVEL: ${this.level}`, 30, 40);
        ctx.fillText(`SCORE: ${this.score} / ${this.levelTargets[this.level-1]}`, 30, 70);
        ctx.textAlign = 'right'; ctx.fillText(`HIGH SCORE: ${this.highScore}`, this.width - 30, 40);
    }

    drawScanlines() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let i = 0; i < this.height; i += 4) {
            this.ctx.fillRect(0, i, this.width, 1);
        }
    }

    drawOverlay(title, subtitle, color) {
        const ctx = this.ctx; ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, this.width, this.height);
        ctx.textAlign = 'center'; ctx.shadowBlur = 20; ctx.shadowColor = color;
        ctx.fillStyle = color; ctx.font = 'bold 45px "Orbitron"';
        ctx.fillText(title, this.width / 2, this.height / 2 - 20);
        ctx.fillStyle = '#fff'; ctx.font = '20px "Orbitron"'; ctx.shadowBlur = 0;
        ctx.fillText(subtitle, this.width / 2, this.height / 2 + 40);
    }

    run() {
        const loop = () => { this.update(); this.draw(); requestAnimationFrame(loop); };
        loop();
    }
}
