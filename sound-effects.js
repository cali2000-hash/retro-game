/**
 * RetroPlay High-Volume Sound Engine (V5 - Direct Action)
 */

window.SoundEngine = {
    audioCtx: null,

    async init() {
        try {
            if (!this.audioCtx) {
                // Creates ONLY when called inside a user event
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                await this.audioCtx.resume();
            }
            console.log("!!! SOUND ENGINE ONLINE !!! State:", this.audioCtx.state);
            return true;
        } catch (e) {
            console.error("Sound Initialization Failed:", e);
            return false;
        }
    },

    async playShoot() {
        if (!this.audioCtx || this.audioCtx.state !== 'running') await this.init();
        if (!this.audioCtx || this.audioCtx.state !== 'running') return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime); // Louder (0.3)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    },

    async playExplosion() {
        if (!this.audioCtx || this.audioCtx.state !== 'running') await this.init();
        if (!this.audioCtx || this.audioCtx.state !== 'running') return;

        const bufferSize = this.audioCtx.sampleRate * 0.15;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.12);
        
        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.6, this.audioCtx.currentTime); // LOUDER (0.6)
        gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 0.15);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        noise.start();
        noise.stop(this.audioCtx.currentTime + 0.15);
    },

    async playJump() {
        if (!this.audioCtx || this.audioCtx.state !== 'running') await this.init();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
    },

    async playBonus() {
        if (!this.audioCtx || this.audioCtx.state !== 'running') await this.init();
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, this.audioCtx.currentTime);
        osc.frequency.setTargetAtTime(1046, this.audioCtx.currentTime + 0.05, 0.05); // High pitch jump
        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.2);
    }
};
