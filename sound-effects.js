/**
 * RetroPlay 8-Bit Web Audio Sound Engine (V3 - Hardened)
 */

const SoundEngine = {
    audioCtx: null,

    async init() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
        console.log("Sound Engine Activated. Current state:", this.audioCtx.state);
    },

    async playShoot() {
        await this.init();
        if (this.audioCtx.state !== 'running') return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    },

    async playExplosion() {
        await this.init();
        if (this.audioCtx.state !== 'running') return;

        const bufferSize = this.audioCtx.sampleRate * 0.15;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);
        
        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.1);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        noise.start();
        noise.stop(this.audioCtx.currentTime + 0.15);
    },

    async playJump() {
        await this.init();
        if (this.audioCtx.state !== 'running') return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, this.audioCtx.currentTime + 0.12);
        
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.12);
    },

    async playBonus() {
        await this.init();
        if (this.audioCtx.state !== 'running') return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setTargetAtTime(523.25, this.audioCtx.currentTime, 0.02); // C5
        osc.frequency.setTargetAtTime(783.99, this.audioCtx.currentTime + 0.05, 0.02); // G5
        
        gain.gain.setTargetAtTime(0.1, this.audioCtx.currentTime, 0.02);
        gain.gain.setTargetAtTime(0.001, this.audioCtx.currentTime + 0.15, 0.02);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.2);
    }
};
