/**
 * Neon Galaga 2077 - Original Space Shooter Engine
 */

class NeonGalagaGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600; // Galaga uses more vertical space
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.gameState = 'start'; // 'start', 'playing', 'gameover', 'victory'
        this.score = 0;
        this.level = 1;

        this.player = {
            x: 400,
            y: 540,
            w: 40,
            h: 30,
            speed: 7,
            color: '#00f2ff'
        };

        this.keys = {};
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        
        this.setupControls();
        this.initEnemies();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') this.shoot();
            if ((this.gameState === 'start' || this.gameState === 'gameover' || this.gameState === 'victory') && e.code === 'Enter') {
                this.reset();
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
    }

    initEnemies() {
        this.enemies = [];
        const rows = 4 + this.level;
        const cols = 8;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push({
                    x: 100 + c * 70,
                    y: 50 + r * 50,
                    w: 30,
                    h: 25,
                    baseX: 100 + c * 70,
                    alive: true,
                    color: r % 2 === 0 ? '#ff00ff' : '#ffff00'
                });
            }
        }
    }

    reset() {
        this.gameState = 'playing';
        this.score = 0;
        this.level = 1;
        this.bullets = [];
        this.particles = [];
        this.initEnemies();
    }

    shoot() {
        if (this.gameState !== 'playing') return;
        this.bullets.push({ x: this.player.x + 18, y: this.player.y, speed: 10 });
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.w) this.player.x += this.player.speed;

        // Bullet logic
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y -= b.speed;
            if (b.y < 0) this.bullets.splice(i, 1);

            // Collision with enemies
            this.enemies.forEach(en => {
                if (en.alive && b.x > en.x && b.x < en.x + en.w && b.y > en.y && b.y < en.y + en.h) {
                    en.alive = false;
                    this.bullets.splice(i, 1);
                    this.score += 100;
                    this.createExplosion(en.x, en.y, en.color);
                }
            });
        }

        // Enemy movement
        let allDead = true;
        const time = Date.now() / 1000;
        const drift = Math.sin(time) * 40;
        this.enemies.forEach(en => {
            if (en.alive) {
                allDead = false;
                en.x = en.baseX + drift;
                // Random attack (Dive)
                if (Math.random() < 0.0005 * this.level) {
                   // Dive logic can be added here
                }
            }
        });

        if (allDead) {
            this.gameState = 'victory';
        }

        // Particle logic
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x + 15, y: y + 10,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1, color
            });
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw Stars (Parallax)
        this.drawStars();

        // Draw Player Ship
        ctx.shadowBlur = 15; ctx.shadowColor = this.player.color;
        ctx.fillStyle = this.player.color;
        ctx.beginPath();
        ctx.moveTo(this.player.x + 20, this.player.y);
        ctx.lineTo(this.player.x, this.player.y + 30);
        ctx.lineTo(this.player.x + 40, this.player.y + 30);
        ctx.closePath();
        ctx.fill();

        // Draw Bullets
        ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff';
        this.bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 15));

        // Draw Enemies
        this.enemies.forEach(en => {
            if (en.alive) {
                ctx.shadowColor = en.color;
                ctx.fillStyle = en.color;
                ctx.fillRect(en.x, en.y, en.w, en.h);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.fillRect(en.x + 5, en.y + 5, en.w - 10, en.h - 10);
            }
        });

        // Draw Particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 3, 3);
            ctx.globalAlpha = 1;
        });

        // UI
        this.drawUI();

        if (this.gameState === 'start') this.drawOverlay('NEON GALAGA 2077', 'PRESS ENTER TO START');
        if (this.gameState === 'gameover') this.drawOverlay('GAME OVER', 'PRESS ENTER TO RETRY');
        if (this.gameState === 'victory') this.drawOverlay('MISSION CLEAR!', 'PRESS ENTER FOR NEXT LEVEL');
    }

    drawUI() {
        const ctx = this.ctx;
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px "Orbitron"';
        ctx.textAlign = 'left'; ctx.fillText(`SCORE: ${this.score}`, 20, 40);
        ctx.textAlign = 'right'; ctx.fillText(`LEVEL: ${this.level}`, this.width - 20, 40);
    }

    drawStars() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137 + Date.now() / 10) % this.width;
            const y = (i * 59) % this.height;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    drawOverlay(title, subtitle) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ff00ff'; this.ctx.font = 'bold 40px "Orbitron"';
        this.ctx.fillText(title, this.width / 2, this.height / 2 - 20);
        this.ctx.fillStyle = '#00f2ff'; this.ctx.font = '20px "Orbitron"';
        this.ctx.fillText(subtitle, this.width / 2, this.height / 2 + 40);
        this.ctx.textAlign = 'left';
    }

    run() {
        const loop = () => {
            this.update(); this.draw();
            requestAnimationFrame(loop);
        };
        loop();
    }
}
