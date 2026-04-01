/**
 * Time Loop Dodge - Sound Manager
 * Handles all audio effects using Web Audio API
 */

const SoundManager = {
    audioContext: null,
    enabled: true,
    isMobile: Utils.isMobile(),

    /**
     * Initialize audio context
     */
    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }

        // Load settings
        const saved = localStorage.getItem('timeLoopDodge_sound');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }

        // Update UI
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) soundToggle.checked = this.enabled;
    },

    /**
     * Toggle sound
     */
    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('timeLoopDodge_sound', this.enabled);
    },

    /**
     * Play a beep sound
     */
    playBeep(frequency = 800, duration = 100, volume = 0.3, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.value = frequency;
            osc.type = type;

            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

            osc.start(now);
            osc.stop(now + duration / 1000);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    },

    /**
     * Play collision sound
     */
    playCollision() {
        if (!this.enabled) return;
        this.playBeep(200, 200, 0.4, 'sine');
        setTimeout(() => this.playBeep(150, 150, 0.3, 'sine'), 100);
    },

    /**
     * Play loop reset sound
     */
    playLoopReset() {
        if (!this.enabled) return;
        this.playBeep(1000, 80, 0.3, 'square');
        setTimeout(() => this.playBeep(1200, 80, 0.3, 'square'), 100);
        setTimeout(() => this.playBeep(1400, 100, 0.3, 'square'), 180);
    },

    /**
     * Play score point sound
     */
    playPoint() {
        if (!this.enabled) return;
        this.playBeep(600, 80, 0.2, 'sine');
    },

    /**
     * Play combo sound
     */
    playCombo() {
        if (!this.enabled) return;
        this.playBeep(800, 100, 0.2, 'sine');
        setTimeout(() => this.playBeep(1000, 100, 0.2, 'sine'), 80);
    },

    /**
     * Play sprint activation sound
     */
    playSprint() {
        if (!this.enabled) return;
        this.playFreqSweep(400, 800, 150, 0.25);
    },

    /**
     * Play game over sound
     */
    playGameOver() {
        if (!this.enabled) return;
        this.playBeep(600, 200, 0.3, 'sine');
        setTimeout(() => this.playBeep(400, 300, 0.3, 'sine'), 200);
    },

    /**
     * Play frequency sweep
     */
    playFreqSweep(startFreq, endFreq, duration, volume = 0.2) {
        if (!this.enabled || !this.audioContext) return;

        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration / 1000);

            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);

            osc.start(now);
            osc.stop(now + duration / 1000);
        } catch (e) {
            console.warn('Error playing sweep:', e);
        }
    },

    /**
     * Play danger warning sound
     */
    playWarning() {
        if (!this.enabled) return;
        this.playBeep(300, 100, 0.3, 'square');
        setTimeout(() => this.playBeep(300, 100, 0.3, 'square'), 120);
    },
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SoundManager.init());
} else {
    SoundManager.init();
}