/**
 * RetroJump 2077 - Original Mini Game Engine
 * A simple, neon-themed 2D runner for the RetroPlay Portal. 
 */

class RetroJumpGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 400;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.gameState = 'start'; // 'start', 'playing', 'gameover'
        this.score = 0;
        this.highScore = localStorage.getItem('retrojump-highscore') || 0;

        // Player properties
        this.player = {
            x: 100,
            y: 300,
            width: 40,
            height: 40,
            dy: 0,
            jumpForce: 15,
            gravity: 0.8,
            isJumping: false,
            color: '#00f2ff' // Cyan neon
        };

        // Obstacles
        this.obstacles = [];
        this.obstacleTimer = 0;
        this.gameSpeed = 6;

        // Listeners
        this.setupControls();
    }

    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') this.handleAction();
        });
        this.canvas.addEventListener('mousedown', () => this.handleAction());
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleAction();
        });
    }

    handleAction() {
        if (this.gameState === 'start' || this.gameState === 'gameover') {
            this.reset();
        } else if (this.gameState === 'playing' && !this.player.isJumping) {
            this.player.dy = -this.player.jumpForce;
            this.player.isJumping = true;
        }
    }

    reset() {
        this.gameState = 'playing';
        this.score = 0;
        this.obstacles = [];
        this.gameSpeed = 6;
        this.player.y = 300;
        this.player.dy = 0;
        this.player.isJumping = false;
        this.obstacleTimer = 0;
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Player physics
        this.player.dy += this.player.gravity;
        this.player.y += this.player.dy;

        if (this.player.y > 310) {
            this.player.y = 310;
            this.player.dy = 0;
            this.player.isJumping = false;
        }

        // Obstacle generation
        this.obstacleTimer++;
        if (this.obstacleTimer > 80 + Math.random() * 50) {
            this.obstacles.push({
                x: this.width,
                y: 310,
                width: 30,
                height: 40,
                color: '#ff00ff' // Magenta neon
            });
            this.obstacleTimer = 0;
        }

        // Obstacle movement & collision
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.gameSpeed;

            // Collision Check
            if (this.player.x < obs.x + obs.width &&
                this.player.x + this.player.width > obs.x &&
                this.player.y < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y) {
                this.gameOver();
            }

            if (obs.x + obs.width < 0) {
                this.obstacles.splice(i, 1);
                this.score++;
                if (this.score % 5 === 0) this.gameSpeed += 0.5;
            }
        }
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
        ctx.fillStyle = '#0a0a1a'; // Dark retro background
        ctx.fillRect(0, 0, this.width, this.height);

        // Grid background
        ctx.strokeStyle = '#1a1a3a';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0); ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y); ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // Ground
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(0, 350, this.width, 50);
        ctx.strokeStyle = '#00f2ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 350); ctx.lineTo(this.width, 350);
        ctx.stroke();

        // Player
        ctx.fillStyle = this.player.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.player.color;
        ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Obstacles
        ctx.shadowBlur = 10;
        this.obstacles.forEach(obs => {
            ctx.fillStyle = obs.color;
            ctx.shadowColor = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        });
        ctx.shadowBlur = 0;

        // UI
        ctx.fillStyle = '#fff';
        ctx.font = '20px "Courier New"';
        ctx.fillText(`SCORE: ${this.score}`, 20, 40);
        ctx.fillText(`HI: ${this.highScore}`, 20, 70);

        if (this.gameState === 'start') {
            this.drawOverlay('RETROJUMP 2077', 'PRESS SPACE TO START');
        } else if (this.gameState === 'gameover') {
            this.drawOverlay('GAME OVER', 'PRESS SPACE TO RETRY');
        }

        // CRT Scanline Effect (Fake)
        this.drawScanlines();
    }

    drawOverlay(title, subtitle) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.font = 'bold 40px "Courier New"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.width / 2, this.height / 2 - 20);
        this.ctx.fillStyle = '#00f2ff';
        this.ctx.font = '20px "Courier New"';
        this.ctx.fillText(subtitle, this.width / 2, this.height / 2 + 40);
        this.ctx.textAlign = 'left';
    }

    drawScanlines() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(18, 16, 16, 0.1)';
        for (let i = 0; i < this.height; i += 4) {
            ctx.fillRect(0, i, this.width, 2);
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
