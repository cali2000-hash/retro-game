/**
 * Neon Galaga 2077 - Evolution 2.0
 * Premium Spaceship Design & Enhanced VFX
 */

class NeonGalagaGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.gameState = 'start';
        this.score = 0;
        this.level = 1;

        this.player = {
            x: 400, y: 530, w: 50, h: 40, speed: 8,
            color: '#00f2ff', boosterFrame: 0
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
        const rows = 4;
        const cols = 8;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push({
                    x: 120 + c * 75, y: 80 + r * 50,
                    w: 30, h: 25, baseX: 120 + c * 75,
                    alive: true, color: r < 2 ? '#ff00ff' : '#00ff88',
                    hp: r < 1 ? 2 : 1
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
        this.bullets.push({ x: this.player.x + 23, y: this.player.y, speed: 12, color: '#f0f' });
        if(window.SoundEngine) SoundEngine.playShoot();
    }

    update() {
        if (this.gameState !== 'playing') return;

        if (this.keys['ArrowLeft'] && this.player.x > 0) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight'] && this.player.x < this.width - this.player.w) this.player.x += this.player.speed;

        this.player.boosterFrame += 0.5;

        // Bullet Logic
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y -= b.speed;
            if (b.y < 0) this.bullets.splice(i, 1);

            this.enemies.forEach(en => {
                if (en.alive && b.x > en.x && b.x < en.x + en.w && b.y > en.y && b.y < en.y + en.h) {
                    en.hp--;
                    this.bullets.splice(i, 1);
                    if(en.hp <= 0) {
                        en.alive = false;
                        this.score += 200;
                        this.createExplosion(en.x, en.y, en.color);
                    } else {
                        this.score += 50;
                    }
                }
            });
        }

        // Enemy Swarm Logic
        let allDead = true;
        const drift = Math.sin(Date.now() / 800) * 50;
        this.enemies.forEach(en => {
            if (en.alive) {
                allDead = false;
                en.x = en.baseX + drift;
            }
        });
        if (allDead) this.gameState = 'victory';

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx; p.y += p.vy; p.life -= 0.02;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    createExplosion(x, y, color) {
        if(window.SoundEngine) SoundEngine.playExplosion();
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: x + 15, y: y + 10,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1, color
            });
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#050510'; ctx.fillRect(0, 0, this.width, this.height);
        this.drawStars();

        this.drawPlayer();

        // Bullets
        this.bullets.forEach(b => {
            ctx.shadowBlur = 10; ctx.shadowColor = b.color;
            ctx.fillStyle = '#fff'; ctx.fillRect(b.x, b.y, 4, 15);
        });

        // Enemies
        this.enemies.forEach(en => {
            if (en.alive) {
                ctx.save();
                ctx.shadowBlur = 10; ctx.shadowColor = en.color;
                ctx.fillStyle = en.color;
                ctx.fillRect(en.x, en.y, en.w, en.h);
                ctx.fillStyle = '#000'; ctx.fillRect(en.x + 5, en.y + 5, en.w - 10, en.h - 10);
                if(en.hp > 1) { // Elite enemy indicator
                    ctx.fillStyle = '#fff'; ctx.fillRect(en.x + 10, en.y + 10, 10, 5);
                }
                ctx.restore();
            }
        });

        // Particles
        this.particles.forEach(p => {
            ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 3, 3); ctx.globalAlpha = 1;
        });

        this.drawUI();
        if (this.gameState === 'start') this.drawOverlay('NEON GALAGA 2077', 'KOREAN RETRO EDITION\n\nPRESS ENTER TO FLY');
        if (this.gameState === 'gameover') this.drawOverlay('MISSION FAILED', 'RELOAD MISSION (ENTER)');
        if (this.gameState === 'victory') this.drawOverlay('ZONE CLEAR', 'PREPARE FOR WARP (ENTER)');
    }

    drawPlayer() {
        const ctx = this.ctx;
        const p = this.player;
        const time = Date.now() / 1000;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.shadowBlur = 20; ctx.shadowColor = p.color;

        // Booster Flame
        const bH = 10 + Math.sin(p.boosterFrame) * 10;
        ctx.fillStyle = '#ff3300';
        ctx.beginPath();
        ctx.moveTo(15, 30); ctx.lineTo(25, 30 + bH); ctx.lineTo(35, 30); ctx.fill();
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.moveTo(20, 30); ctx.lineTo(25, 30 + bH * 0.6); ctx.lineTo(30, 30); ctx.fill();

        // Main Body (Cyber Hawk)
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(25, 0);   // Nose
        ctx.lineTo(0, 35);   // Left Wing
        ctx.lineTo(15, 30);  // Left Intake
        ctx.lineTo(35, 30);  // Right Intake
        ctx.lineTo(50, 35);  // Right Wing
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(25, 5); ctx.lineTo(20, 20); ctx.lineTo(30, 20); ctx.closePath();
        ctx.fill();

        // Wings Details
        ctx.fillStyle = '#000';
        ctx.fillRect(5, 25, 5, 5); ctx.fillRect(40, 25, 5, 5);

        ctx.restore();
    }

    drawUI() {
        const ctx = this.ctx; ctx.fillStyle = '#fff'; ctx.font = 'bold 20px "Orbitron"';
        ctx.textAlign = 'left'; ctx.fillText(`SCORE: ${this.score}`, 30, 40);
        ctx.textAlign = 'right'; ctx.fillText(`SYSTEM: STABLE`, this.width - 30, 40);
    }

    drawStars() {
        const ctx = this.ctx; ctx.fillStyle = 'rgba(255,255,255,0.2)';
        for (let i = 0; i < 60; i++) {
            const x = (i * 137 + Date.now() / 15) % this.width;
            const y = (i * 59 + Date.now() / 8) % this.height;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    drawOverlay(title, subtitle) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.85)'; this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.textAlign = 'center'; this.ctx.fillStyle = '#ff00ff'; this.ctx.font = 'bold 50px "Orbitron"';
        this.ctx.fillText(title, this.width / 2, this.height / 2 - 20);
        this.ctx.fillStyle = '#00f2ff'; this.ctx.font = '22px "Orbitron"';
        this.ctx.fillText(subtitle, this.width / 2, this.height / 2 + 50);
    }

    run() {
        const loop = () => { this.update(); this.draw(); requestAnimationFrame(loop); };
        loop();
    }
}
