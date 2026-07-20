// Audio Synthesizer using Web Audio API
class AudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        
        // Volume settings (0.0 to 1.0)
        this.sfxVolumeSetting = 0.6;
        this.musicVolumeSetting = 0.4;
        
        // Sequencer state for background music
        this.isPlayingMusic = false;
        this.tempo = 125; // BPM
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // seconds
        this.nextNoteTime = 0.0;
        this.currentStep = 0;
        this.timerId = null;
        
        // Delay node for spacious melody echo
        this.delayNode = null;
        
        // Musical notes pool (A Minor Pentatonic scale: A, C, D, E, G)
        this.bassNotes = [
            55.00,  // A1
            65.41,  // C2
            73.42,  // D2
            82.41,  // E2
            98.00   // G2
        ];
        
        this.melodyNotes = [
            220.00, // A3
            261.63, // C4
            293.66, // D4
            329.63, // E4
            392.00, // G4
            440.00, // A4
            523.25, // C5
            587.33, // D5
            659.25, // E5
            783.99  // G5
        ];

        // Harmonic progressions for A Minor Cyber-theme
        // 4 bars of 8 steps each
        this.bassSequence = [
            0, 0, 0, 0, 1, 1, 1, 1, // Bar 1: A1, C2
            3, 3, 3, 3, 4, 4, 4, 4  // Bar 2: E2, G2
        ];
        
        // Noise buffer for drum synthesizers
        this.noiseBuffer = null;
    }

    /**
     * Lazy initialize the AudioContext after user interaction
     */
    init() {
        if (this.ctx) return;
        
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
            console.warn("Web Audio API not supported in this browser.");
            return;
        }
        
        this.ctx = new AudioContextClass();
        
        // Create gains
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolumeSetting, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
        
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolumeSetting, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);
        
        // Set up delay/echo node for melodies
        this.delayNode = this.ctx.createDelay(1.0);
        this.delayFeedback = this.ctx.createGain();
        
        this.delayNode.delayTime.setValueAtTime(0.3, this.ctx.currentTime);
        this.delayFeedback.gain.setValueAtTime(0.4, this.ctx.currentTime);
        
        // Connect melody output -> delay -> feedback loop -> delay -> musicGain
        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode);
        this.delayNode.connect(this.musicGain);

        // Pre-create white noise buffer
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
    }

    /**
     * Start the procedural background battle music
     */
    startMusic() {
        this.init();
        if (this.isPlayingMusic) return;
        if (!this.ctx) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isPlayingMusic = true;
        this.nextNoteTime = this.ctx.currentTime;
        this.currentStep = 0;
        this.scheduler();
    }

    /**
     * Stop background music
     */
    stopMusic() {
        this.isPlayingMusic = false;
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }

    /**
     * Set music volume (0 to 1)
     */
    setMusicVolume(vol) {
        this.musicVolumeSetting = vol;
        if (this.musicGain && this.ctx) {
            this.musicGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
        }
    }

    /**
     * Set SFX volume (0 to 1)
     */
    setSFXVolume(vol) {
        this.sfxVolumeSetting = vol;
        if (this.sfxGain && this.ctx) {
            this.sfxGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
        }
    }

    /**
     * Adjust music tempo
     */
    setTempo(bpm) {
        this.tempo = bpm;
    }

    /**
     * The scheduling loop running in background
     */
    scheduler() {
        if (!this.isPlayingMusic) return;
        
        while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentStep, this.nextNoteTime);
            this.advanceNote();
        }
        
        this.timerId = setTimeout(() => this.scheduler(), this.lookahead);
    }

    advanceNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        // Step is 8th note, so quarter-beat is 0.5 beats per step
        this.nextNoteTime += 0.5 * secondsPerBeat;
        this.currentStep = (this.currentStep + 1) % 16;
    }

    /**
     * Schedule synthesized drums and notes for the music sequencer
     */
    scheduleNote(step, time) {
        // --- 1. Synthesize Drums ---
        // Kick on 0, 4, 8, 12
        if (step % 4 === 0) {
            this.synthKick(time);
        }
        // Snare on 4, 12 (shifted by 2 beats: steps 2, 6, 10, 14)
        if (step % 4 === 2) {
            this.synthSnare(time);
        }
        // Hihat on odd beats
        if (step % 2 === 1) {
            this.synthHihat(time);
        }

        // --- 2. Synthesize Bass ---
        // Play simple eighth note bassline
        const bassProgression = [
            0, 0, 0, 0, 1, 1, 1, 1,  // Bar 1: A1, C2
            3, 3, 3, 3, 2, 2, 4, 4   // Bar 2: E2, D2, G2
        ];
        const noteIdx = bassProgression[step % 16];
        const freq = this.bassNotes[noteIdx];
        this.synthBassNote(freq, time);

        // --- 3. Synthesize Melody ---
        // Play a random light note from scale on certain steps to create procedural tunes
        // High density of notes at higher levels, make it feel energetic
        const melodyChance = 0.35;
        if (Math.random() < melodyChance && (step % 2 === 0)) {
            // Pick a note from pentatonic scale
            const noteVal = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
            this.synthMelodyNote(noteVal, time);
        }
    }

    // ==========================================
    // INSTRUMENT SYNTHESIZERS (for Music)
    // ==========================================

    synthKick(time) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.12);
        
        gainNode.gain.setValueAtTime(0.5, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.12);
        
        osc.start(time);
        osc.stop(time + 0.13);
    }

    synthSnare(time) {
        if (!this.ctx || !this.noiseBuffer) return;
        
        // Noise source
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = this.noiseBuffer;
        
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 1000;
        
        const noiseGain = this.ctx.createGain();
        
        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.musicGain);
        
        noiseGain.gain.setValueAtTime(0.25, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
        
        // Snare "body" tone (sine)
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.connect(oscGain);
        oscGain.connect(this.musicGain);
        
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.linearRampToValueAtTime(100, time + 0.08);
        
        oscGain.gain.setValueAtTime(0.2, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
        
        noiseSrc.start(time);
        noiseSrc.stop(time + 0.2);
        
        osc.start(time);
        osc.stop(time + 0.1);
    }

    synthHihat(time) {
        if (!this.ctx || !this.noiseBuffer) return;
        
        const source = this.ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 8000;
        
        const gainNode = this.ctx.createGain();
        
        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        gainNode.gain.setValueAtTime(0.08, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        
        source.start(time);
        source.stop(time + 0.05);
    }

    synthBassNote(frequency, time) {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(frequency, time);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        // Duck slightly when kick hits
        const startGain = (this.currentStep % 4 === 0) ? 0.15 : 0.22;
        
        gainNode.gain.setValueAtTime(startGain, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.18);
        
        osc.start(time);
        osc.stop(time + 0.2);
    }

    synthMelodyNote(frequency, time) {
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        // Custom cyber-square/saw sound
        osc.type = Math.random() > 0.5 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(frequency, time);
        
        // Low pass sweeps
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, time);
        filter.frequency.exponentialRampToValueAtTime(200, time + 0.3);
        
        osc.connect(filter);
        filter.connect(gainNode);
        
        // Send melody to both main output and the delay node
        gainNode.connect(this.musicGain);
        gainNode.connect(this.delayNode);
        
        gainNode.gain.setValueAtTime(0.04, time);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        
        osc.start(time);
        osc.stop(time + 0.3);
    }

    // ==========================================
    // SOUND EFFECTS (SFX)
    // ==========================================

    playClick() {
        this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        // Random slight pitch variance for mechanical click feel
        const pitch = 1500 + Math.random() * 600;
        osc.frequency.setValueAtTime(pitch, time);
        
        gain.connect(this.sfxGain);
        osc.connect(gain);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        
        osc.start(time);
        osc.stop(time + 0.04);
    }

    playHit() {
        // Metallic slash hit (sword)
        this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const time = this.ctx.currentTime;
        
        // 1. Noise burst for physical impact crunch
        if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            
            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(800, time);
            
            const noiseGain = this.ctx.createGain();
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            noiseGain.gain.setValueAtTime(0.4, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            
            noise.start(time);
            noise.stop(time + 0.18);
        }
        
        // 2. High-frequency ring oscillators (sword chime)
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1100, time);
        osc1.frequency.exponentialRampToValueAtTime(600, time + 0.25);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1650, time);
        osc2.frequency.exponentialRampToValueAtTime(900, time + 0.2);
        
        osc1.connect(oscGain);
        osc2.connect(oscGain);
        oscGain.connect(this.sfxGain);
        
        oscGain.gain.setValueAtTime(0.25, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        
        osc1.start(time);
        osc2.start(time);
        osc1.stop(time + 0.26);
        osc2.stop(time + 0.26);
    }

    playPunch() {
        // Heavy, blunt punch impact
        this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const time = this.ctx.currentTime;
        
        // 1. Thump sound (low sine pitch drop)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.15);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
        
        // 2. Noise texture
        if (this.noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.noiseBuffer;
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, time);
            
            const noiseGain = this.ctx.createGain();
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            noiseGain.gain.setValueAtTime(0.5, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            
            noise.start(time);
            noise.stop(time + 0.12);
        }
        
        osc.start(time);
        osc.stop(time + 0.2);
    }

    playError() {
        // Buzz sound for incorrect keys
        this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, time);
        osc.frequency.setValueAtTime(105, time + 0.1);
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, time);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
        
        osc.start(time);
        osc.stop(time + 0.22);
    }

    playUIClick() {
        this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const time = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, time);
        osc.frequency.exponentialRampToValueAtTime(440, time + 0.08);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
        
        osc.start(time);
        osc.stop(time + 0.09);
    }

    playVictory() {
        // Triumphant ascending synth arpeggio
        this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const time = this.ctx.currentTime;
        
        // Major chord sequence: A4 (440), C#5 (554.37), E5 (659.25), A5 (880)
        const notes = [440, 554.37, 659.25, 880];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time + idx * 0.12);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            gain.gain.setValueAtTime(0, time + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.2, time + idx * 0.12 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.12 + 0.4);
            
            osc.start(time + idx * 0.12);
            osc.stop(time + idx * 0.12 + 0.45);
        });
    }

    playDefeat() {
        // Melancholy descending minor progression
        this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') this.ctx.resume();
        
        const time = this.ctx.currentTime;
        
        // Minor/diminished feel: C4 (261.63), Ab3 (207.65), F3 (174.61), Db3 (138.59)
        const notes = [261.63, 207.65, 174.61, 138.59];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, time + idx * 0.18);
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, time + idx * 0.18);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            
            gain.gain.setValueAtTime(0, time + idx * 0.18);
            gain.gain.linearRampToValueAtTime(0.25, time + idx * 0.18 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.18 + 0.6);
            
            osc.start(time + idx * 0.18);
            osc.stop(time + idx * 0.18 + 0.65);
        });
    }
}

// Export for ES6 modules if loaded, or bind to window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioSynthesizer };
} else {
    window.audioSynth = new AudioSynthesizer();
}
