/**
 * RetroJump 2077: Evolution
 * Improved original game with levels, characters, and missions.
 */

class RetroJumpGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 400;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.gameState = 'start'; // 'start', 'playing', 'level-clear', 'gameover'
        this.score = 0;
        this.highScore = localStorage.getItem('retrojump-highscore') || 0;
        
        // Level System
        this.level = 1;
        this.levelTargets = [10, 30, 60, 100, 999]; // Score needed to clear
        this.levelThemes = [
            { main: '#00f2ff', bg: '#0a0a1a', speed: 6 }, // Level 1: Cyan
            { main: '#ff00ff', bg: '#1a051a', speed: 8 }, // Level 2: Magenta
            { main: '#ffff00', bg: '#1a1a05', speed: 10 }, // Level 3: Yellow
            { main: '#00ff00', bg: '#051a05', speed: 12 }, // Level 4: Green
        ];

        // Player (Cyber Cat Robot)
        this.player = {
            x: 100,
            y: 300,
            width: 40,
            height: 40,
            dy: 0,
            jumpForce: 15,
            gravity: 0.8,
            isJumping: false,
            frame: 0 // Animation frame
        };

        this.obstacles = [];
        this.obstacleTimer = 0;
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
        }
    }

    reset(level = 1) {
        this.gameState = 'playing';
        this.level = level;
        this.score = 0;
        this.obstacles = [];
        this.player.y = 310;
        this.player.dy = 0;
        this.player.isJumping = false;
        this.obstacleTimer = 0;
    }

    nextLevel() {
        this.gameState = 'level-clear';
        setTimeout(() => {
            if (this.level < this.levelThemes.length) {
                this.level++;
                this.reset(this.level);
            } else {
                this.gameState = 'playing'; // Endless after last level
            }
        }, 2000);
    }

    update() {
        if (this.gameState !== 'playing') return;

        const theme = this.levelThemes[this.level - 1] || this.levelThemes[0];

        // Player physics
        this.player.dy += this.player.gravity;
        this.player.y += this.player.dy;
        this.player.frame += 0.2; // Slowly cycle animation

        if (this.player.y > 310) {
            this.player.y = 310;
            this.player.dy = 0;
            this.player.isJumping = false;
        }

        // Obstacle generation (Depends on level)
        this.obstacleTimer++;
        const spawnRate = Math.max(40, 80 - (this.level * 5));
        if (this.obstacleTimer > spawnRate + Math.random() * 50) {
            this.obstacles.push({
                x: this.width,
                y: 310,
                width: 30,
                height: 40,
                color: theme.main
            });
            this.obstacleTimer = 0;
        }

        // Obstacle movement & collision
        const speed = theme.speed;
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= speed;

            // Collision Check
            if (this.player.x + 10 < obs.x + obs.width &&
                this.player.x + this.player.width - 10 > obs.x &&
                this.player.y + 5 < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y) {
                this.gameOver();
            }

            if (obs.x + obs.width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                
                // Level Clear Check
                if (this.score >= this.levelTargets[this.level - 1]) {
                    this.nextLevel();
                }
            }
        }
    }

    gameOver() {
        this.gameState = 'gameover';
        if (this.totalScore() > this.highScore) {
            this.highScore = this.totalScore();
            localStorage.setItem('retrojump-highscore', this.highScore);
        }
    }

    totalScore() {
        return this.score + (this.level - 1) * 100;
    }

    draw() {
        const ctx = this.ctx;
        const theme = this.levelThemes[this.level - 1] || this.levelThemes[0];
        
        // Background
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Parallax Stars/Glow
        this.drawParallax();

        // Ground
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 350, this.width, 50);
        ctx.strokeStyle = theme.main;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 350);
        ctx.lineTo(this.width, 350);
        ctx.stroke();

        // Draw Player (Robot Cat)
        this.drawPlayer(theme.main);
        
        // Draw Obstacles (Cyber Viruses)
        this.obstacles.forEach(obs => {
            this.drawObstacle(obs);
        });

        // UI Header
        this.drawUI(theme.main);

        // Overlays
        if (this.gameState === 'start') {
            this.drawOverlay('CYBER RUNNER 2077', 'MISSION: REACH LEVEL 5', theme.main);
        } else if (this.gameState === 'gameover') {
            this.drawOverlay('MISSION FAILED', `FINAL SCORE: ${this.score}`, '#ff0000');
        } else if (this.gameState === 'level-clear') {
            this.drawOverlay(`LEVEL ${this.level} CLEAR!`, 'PREPARING NEXT MISSION...', '#00ff00');
        }

        this.drawScanlines();
    }

    drawPlayer(color) {
        const ctx = this.ctx;
        const p = this.player;
        const jumpOffset = Math.sin(p.frame) * 2;
        
        ctx.save();
        ctx.translate(p.x, p.y + (p.isJumping ? 0 : jumpOffset));
        
        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        
        // Body (Simple Pixel Cat Shape)
        ctx.fillStyle = color;
        ctx.fillRect(5, 10, 30, 25); // Main body
        ctx.fillRect(0, 5, 10, 10);  // Left Ear
        ctx.fillRect(30, 5, 10, 10); // Right Ear
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(8, 15, 6, 6);
        ctx.fillRect(26, 15, 6, 6);
        
        // Tail
        ctx.fillStyle = color;
        const tailY = Math.sin(p.frame * 2) * 5;
        ctx.fillRect(-5, 20 + tailY, 10, 5);
        
        ctx.restore();
    }

    drawObstacle(obs) {
        const ctx = this.ctx;
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = obs.color;
        ctx.fillStyle = obs.color;
        
        // Virus Octagon Shape
        ctx.translate(obs.x + 15, obs.y + 20);
        ctx.rotate(Date.now() / 200);
        ctx.fillRect(-15, -15, 30, 30);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-15, -15, 30, 30);
        
        ctx.restore();
    }

    drawUI(color) {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.font = 'bold 18px "Orbitron", "Courier New"';
        ctx.textAlign = 'left';
        ctx.fillText(`LEVEL: ${this.level}`, 30, 40);
        ctx.fillText(`SCORE: ${this.score} / ${this.levelTargets[this.level-1]}`, 30, 70);
        
        ctx.textAlign = 'right';
        ctx.fillText(`HIGH SCORE: ${this.highScore}`, this.width - 30, 40);
    }

    drawParallax() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for(let i=0; i<20; i++) {
            const x = (Date.now() / 20 + i * 100) % this.width;
            ctx.fillRect(x, 50 + i * 10, 2, 2);
        }
    }

    drawOverlay(title, subtitle, color) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.font = 'bold 45px "Courier New"';
        ctx.fillText(title, this.width / 2, this.height / 2 - 20);
        
        ctx.fillStyle = '#fff';
        ctx.font = '20px "Courier New"';
        ctx.shadowBlur = 0;
        ctx.fillText(subtitle, this.width / 2, this.height / 2 + 40);
    }

    drawScanlines() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        for (let i = 0; i < this.height; i += 4) {
            this.ctx.fillRect(0, i, this.width, 1);
        }
    }

    run() {
        const loop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(loop);
        };
        loop();
    }
}
