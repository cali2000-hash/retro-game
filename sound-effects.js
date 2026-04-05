/**
 * RetroPlay High-Volume Sound Engine (V6 - Toggle Support)
 */

window.SoundEngine = {
    audioCtx: null,
    isEnabled: false,

    async init() {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                await this.audioCtx.resume();
            }
            this.isEnabled = true;
            console.log("SOUND ENGINE V6 ONLINE: Status - Active");
            return true;
        } catch (e) {
            console.error("Sound Engine V6 Failure:", e);
            return false;
        }
    },

    disable() {
        this.isEnabled = false;
        console.log("SOUND ENGINE V6 Muted");
    },

    async playShoot() {
        if (!this.isEnabled) return;
        if (!this.audioCtx || this.audioCtx.state !== 'running') await this.init();

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    },

    async playExplosion() {
        if (!this.isEnabled) return;
        if (!this.audioCtx || this.audioCtx.state !== 'running') await this.init();

        const bufferSize = this.audioCtx.sampleRate * 0.15;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.15);
        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.8, this.audioCtx.currentTime); // High volume explosion
        gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.2);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        noise.start();
        noise.stop(this.audioCtx.currentTime + 0.2);
    },

    async playJump() {
        if (!this.isEnabled) return;
        if (!this.audioCtx || this.audioCtx.state !== 'running') await this.init();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, this.audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
    },

    async playBonus() {
        if (!this.isEnabled) return;
        if (!this.audioCtx || this.audioCtx.state !== 'running') await this.init();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.audioCtx.currentTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(1500, this.audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.2);
    }
};
