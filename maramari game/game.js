// Word Warrior Typing Combat - Core Game Controller

class GameController {
    constructor() {
        this.renderer = null;
        this.wordManager = null;
        
        // Game States: 'MENU', 'LEVEL_SELECT', 'PLAYING', 'PAUSED', 'RESULTS'
        this.state = 'MENU';
        
        // Level Configuration
        this.levelConfigs = [];
        this.initLevelConfigs();
        
        // Active Game Variables
        this.currentLevel = 1;
        this.player = null;
        this.enemy = null;
        this.enemyName = "";
        
        // Timers
        this.levelTimerInterval = null;
        this.enemyAttackCharge = 0; // 0 to 100%
        this.lastFrameTime = 0;
        
        // Word & Typing State
        this.currentWord = "";
        this.typedIndex = 0;
        this.wrongLetterFlashTimer = 0;
        
        // Player stats for current level
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.accuracy = 100;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.correctLettersForWpm = 0;
        this.totalDamageDealt = 0;
        this.playerEnergy = 0;
        this.wpm = 0;
        
        // Time tracking for WPM
        this.levelElapsedSeconds = 0;
        
        // Local Save Progress
        this.progress = {
            unlockedLevel: 1,
            stars: {}, // { levelNum: starsCount }
            ttsEnabled: true // default voice pronunciation to ON
        };
        this.loadProgress();

        // UI references
        this.hudElements = {};
    }

    /**
     * Programmatically build configs for 20 levels with smooth scaling
     */
    initLevelConfigs() {
        this.levelConfigs = [];
        for (let i = 1; i <= 20; i++) {
            let enemyType = 'slime';
            let enemyName = '';
            
            if (i <= 5) {
                enemyType = 'slime';
                enemyName = `Forest Slime`;
            } else if (i <= 10) {
                enemyType = 'orc';
                enemyName = `Orc Marauder`;
            } else if (i <= 15) {
                enemyType = 'darkknight';
                enemyName = `Dark Knight`;
            } else {
                enemyType = 'dragon';
                enemyName = `Fire Dragon Boss`;
            }

            // Word Spawner rate scales down (faster spawner/cooldown)
            // HP scale: 80, 100, 120... up to 480
            // Cooldown scale: 6000ms down to 1800ms
            // Damage scale: 8 up to 35
            this.levelConfigs.push({
                level: i,
                enemyType: enemyType,
                enemyName: enemyName + ` (Tier ${Math.ceil(i/5)})`,
                enemyHp: 70 + i * 20, 
                enemyAttackCooldown: Math.max(1600, 6500 - i * 240), 
                enemyDamage: 6 + i * 1.5,
                enemyBlockChance: i > 5 ? 0.05 + (i - 5) * 0.02 : 0.0, // max 33% block chance at level 20
                starsThresholds: {
                    3: 20 + i * 2.5, // 3 Star WPM threshold: lvl 1: 22.5, lvl 20: 70
                    2: 12 + i * 1.5, // 2 Star WPM threshold: lvl 1: 13.5, lvl 20: 42
                    1: 8             // 1 Star WPM threshold: 8 WPM minimum
                }
            });
        }
    }

    init() {
        // Instantiate manager modules
        this.renderer = new GameRenderer('game-canvas');
        this.wordManager = new WordManager();
        
        // Cache UI element selectors
        this.hudElements = {
            screens: {
                menu: document.getElementById('screen-menu'),
                levels: document.getElementById('screen-levels'),
                game: document.getElementById('screen-game'),
                pause: document.getElementById('screen-pause'),
                results: document.getElementById('screen-results')
            },
            playerHpBar: document.getElementById('player-hp'),
            playerHpDelay: document.getElementById('player-hp-delay'),
            playerHpText: document.getElementById('player-hp-text'),
            playerEnergy: document.getElementById('player-energy'),
            
            enemyHpBar: document.getElementById('enemy-hp'),
            enemyHpDelay: document.getElementById('enemy-hp-delay'),
            enemyHpText: document.getElementById('enemy-hp-text'),
            enemyName: document.getElementById('enemy-name-title'),
            
            timer: document.getElementById('hud-timer'),
            levelText: document.getElementById('hud-level'),
            wordDisplay: document.getElementById('active-word-display'),
            
            accuracy: document.getElementById('stat-accuracy'),
            wpm: document.getElementById('stat-wpm'),
            score: document.getElementById('stat-score'),
            comboCount: document.getElementById('hud-combo-count'),
            comboLabel: document.getElementById('hud-combo-label'),
            comboMult: document.getElementById('hud-combo-mult')
        };
        
        // Bind UI input settings and click triggers
        this.bindEvents();
        
        // Populates levels select grid
        this.renderLevelsGrid();

        // ── TTS Setup ──────────────────────────────────────────────────────────
        this.ttsVoice = null;
        this.ttsReady = false; // set to true once user has clicked (gesture required)
        this.ttsPendingWord = null; // word queued before first gesture
        
        if ('speechSynthesis' in window) {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    this.ttsVoice = voices.find(v => v.lang === 'en-US' && v.localService)
                                 || voices.find(v => v.lang.startsWith('en') && v.localService)
                                 || voices.find(v => v.lang === 'en-US')
                                 || voices.find(v => v.lang.startsWith('en'))
                                 || null;
                    console.log('[TTS] Voice loaded:', this.ttsVoice ? this.ttsVoice.name : '(none — will use browser default)');
                }
            };
            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
            
            // Chrome freezes speech queue after ~15s idle — keepalive prevents this
            setInterval(() => {
                if (window.speechSynthesis.paused) window.speechSynthesis.resume();
            }, 5000);
        }
        
        // Run game render update loop
        window.requestAnimationFrame((time) => this.gameLoop(time));
    }

    bindEvents() {
        // Start Menu button hooks
        document.getElementById('btn-play').addEventListener('click', () => {
            this.playUIClick();
            this.ttsUnlock(); // Unlock TTS engine on first user gesture
            this.changeState('LEVEL_SELECT');
        });
        
        document.getElementById('btn-menu-back').addEventListener('click', () => {
            this.playUIClick();
            this.changeState('MENU');
        });
        
        document.getElementById('btn-pause').addEventListener('click', () => {
            this.playUIClick();
            this.pauseGame();
        });

        // Pause menu actions
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.playUIClick();
            this.resumeGame();
        });
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.playUIClick();
            this.restartLevel();
        });
        document.getElementById('btn-pause-menu').addEventListener('click', () => {
            this.playUIClick();
            this.changeState('LEVEL_SELECT');
        });

        // Results screen actions
        document.getElementById('btn-results-retry').addEventListener('click', () => {
            this.playUIClick();
            this.restartLevel();
        });
        document.getElementById('btn-results-next').addEventListener('click', () => {
            this.playUIClick();
            if (this.currentLevel < 20) {
                this.currentLevel++;
                this.startLevel(this.currentLevel);
            } else {
                this.changeState('LEVEL_SELECT');
            }
        });
        document.getElementById('btn-results-menu').addEventListener('click', () => {
            this.playUIClick();
            this.changeState('LEVEL_SELECT');
        });

        // Keyboard captures (typing)
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Volume controls
        const sfxSlider = document.getElementById('volume-sfx');
        const musicSlider = document.getElementById('volume-music');
        const ttsToggle = document.getElementById('toggle-tts');
        
        // Populate current UI preference state
        ttsToggle.checked = this.progress.ttsEnabled;
        
        sfxSlider.addEventListener('input', (e) => {
            if (window.audioSynth) window.audioSynth.setSFXVolume(parseFloat(e.target.value));
        });
        musicSlider.addEventListener('input', (e) => {
            if (window.audioSynth) window.audioSynth.setMusicVolume(parseFloat(e.target.value));
        });
        ttsToggle.addEventListener('change', (e) => {
            this.progress.ttsEnabled = e.target.checked;
            this.saveProgress();
        });

        // Diagnostic Voice Test button hook
        document.getElementById('btn-test-tts').addEventListener('click', () => {
            const diagStatus = document.getElementById('tts-diagnostic-status');
            
            if (!('speechSynthesis' in window)) {
                diagStatus.innerText = "✗ SpeechSynthesis not supported";
                diagStatus.style.color = "#ff3b30";
                return;
            }
            
            // This button click IS a user gesture — use it to unlock TTS
            this.ttsUnlock();
            
            const voiceName = this.ttsVoice ? this.ttsVoice.name : 'browser default';
            diagStatus.innerText = `Testing (voice: ${voiceName})...`;
            diagStatus.style.color = "var(--neon-cyan)";
            
            // Give unlock time to fire, then speak test phrase
            setTimeout(() => {
                const u = new SpeechSynthesisUtterance("Word Warrior voice test");
                u.lang = 'en-US';
                u.rate = 0.85;
                u.volume = 1.0;
                if (this.ttsVoice) u.voice = this.ttsVoice;
                
                u.onstart = () => {
                    diagStatus.innerText = `✓ Working! Voice: ${voiceName}`;
                    diagStatus.style.color = "#34c759";
                };
                u.onerror = (e) => {
                    diagStatus.innerText = `✗ Error: "${e.error}" — check volume/Chrome settings`;
                    diagStatus.style.color = "#ff3b30";
                    console.error("[TTS Test] Error:", e);
                };
                
                window.speechSynthesis.speak(u);
                
                // Timeout fallback if no event fires
                setTimeout(() => {
                    if (diagStatus.innerText.startsWith("Testing")) {
                        diagStatus.innerText = "⚠ No response from browser audio engine";
                        diagStatus.style.color = "#ff9500";
                    }
                }, 3000);
            }, 200);
        });

        // Fullscreen toggle
        document.getElementById('btn-fullscreen').addEventListener('click', () => {
            this.toggleFullscreen();
        });
    }

    /**
     * Volume UI feedback beep
     */
    playUIClick() {
        if (window.audioSynth) window.audioSynth.playUIClick();
    }

    /**
     * Progress Save & Load
     */
    loadProgress() {
        try {
            const saved = localStorage.getItem('wordWarriorSave');
            if (saved) {
                this.progress = JSON.parse(saved);
                // Ensure default value is loaded if missing from legacy save structure
                if (this.progress.ttsEnabled === undefined) {
                    this.progress.ttsEnabled = true;
                }
            }
        } catch (e) {
            console.error("Could not load local save progress", e);
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('wordWarriorSave', JSON.stringify(this.progress));
        } catch (e) {
            console.error("Could not write local save progress", e);
        }
    }

    /**
     * Render level blocks in Level Select Menu
     */
    renderLevelsGrid() {
        const grid = document.getElementById('levels-grid-container');
        grid.innerHTML = "";
        
        for (let i = 1; i <= 20; i++) {
            const isUnlocked = i <= this.progress.unlockedLevel;
            const stars = this.progress.stars[i] || 0;
            
            const card = document.createElement('div');
            card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.playUIClick();
                    this.startLevel(i);
                });
                
                // Show stars
                let starsHtml = `<div class="level-stars">`;
                for (let s = 1; s <= 3; s++) {
                    starsHtml += `<span class="star-icon ${s <= stars ? 'active' : ''}">★</span>`;
                }
                starsHtml += `</div>`;
                
                // Set tier text based on difficulty groups
                let tierText = "T1: Short";
                if (i > 5 && i <= 10) tierText = "T2: Medium";
                else if (i > 10 && i <= 15) tierText = "T3: Long";
                else if (i > 15) tierText = "T4: Advanced";

                card.innerHTML = `
                    <div class="level-num">${i}</div>
                    ${starsHtml}
                    <div class="level-tier-text">${tierText}</div>
                `;
            } else {
                card.innerHTML = `
                    <div class="lock-icon">🔒</div>
                    <div class="level-tier-text">LOCKED</div>
                `;
            }
            grid.appendChild(card);
        }
    }

    /**
     * Fullscreen API toggle
     */
    toggleFullscreen() {
        const container = document.getElementById('game-container');
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * State Machine Transitions
     */
    changeState(newState) {
        // Hide all screens
        Object.values(this.hudElements.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        this.state = newState;
        
        if (newState === 'MENU') {
            this.hudElements.screens.menu.classList.add('active');
            if (window.audioSynth) window.audioSynth.stopMusic();
        } else if (newState === 'LEVEL_SELECT') {
            this.renderLevelsGrid();
            this.hudElements.screens.levels.classList.add('active');
            if (window.audioSynth) window.audioSynth.stopMusic();
        } else if (newState === 'PLAYING') {
            this.hudElements.screens.game.classList.add('active');
            if (window.audioSynth) window.audioSynth.startMusic();
        } else if (newState === 'PAUSED') {
            this.hudElements.screens.game.classList.add('active');
            this.hudElements.screens.pause.classList.add('active');
        } else if (newState === 'RESULTS') {
            this.hudElements.screens.results.classList.add('active');
            if (window.audioSynth) window.audioSynth.stopMusic();
        }
    }

    /**
     * Start Level setup
     */
    startLevel(levelNum) {
        this.currentLevel = levelNum;
        const config = this.levelConfigs[levelNum - 1];
        
        // Reset statistics
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.accuracy = 100;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.correctLettersForWpm = 0;
        this.totalDamageDealt = 0;
        this.playerEnergy = 0;
        this.wpm = 0;
        
        this.levelElapsedSeconds = 0;
        this.enemyAttackCharge = 0;
        this.lastFrameTime = performance.now();
        
        // Calculate enemy speed based on level travel times
        let travelTime = 30;
        if (this.currentLevel === 1) {
            travelTime = 30;
        } else if (this.currentLevel === 2) {
            travelTime = 20;
        } else if (this.currentLevel === 3) {
            travelTime = 10;
        } else {
            // Speed up for higher levels, capping at 3.0 seconds
            travelTime = Math.max(3.0, 10 - (this.currentLevel - 3) * 0.45);
        }
        
        // Starting X is 804, touch point is 300
        const distanceToPlayer = 804 - 300;
        this.enemySpeed = distanceToPlayer / travelTime; // pixels per second
        
        // Instantiate characters on the canvas
        // Player Knight facing right at 220, Enemy at 804 facing left
        this.player = new GameCharacter('player', 220, 0, true);
        this.player.maxHp = 100;
        this.player.hp = 100;
        
        this.enemy = new GameCharacter(config.enemyType, 804, 0, false);
        this.enemy.maxHp = config.enemyHp;
        this.enemy.hp = config.enemyHp;
        this.enemyName = config.enemyName;
        
        // Visual effects system clean slate
        this.renderer.particles = [];
        this.renderer.slashes = [];
        this.renderer.floatingTexts = [];
        this.renderer.initBackgroundParticles();
        
        // Setup initial typing word
        this.loadNewWord();
        
        // Push stats to UI elements immediately
        this.updateHUDStats();
        this.updateHPBars();
        
        // Set dynamic audio music tempo
        // Increases step by step for tension
        if (window.audioSynth) {
            window.audioSynth.setTempo(120 + levelNum * 2);
        }

        // Start level timer interval
        if (this.levelTimerInterval) clearInterval(this.levelTimerInterval);
        this.levelTimerInterval = setInterval(() => this.tickLevelTimer(), 1000);
        
        this.changeState('PLAYING');
    }

    tickLevelTimer() {
        if (this.state !== 'PLAYING') return;

        this.levelElapsedSeconds++;
        
        // Recalculate WPM periodically
        if (this.levelElapsedSeconds > 0) {
            this.wpm = Math.round((this.correctLettersForWpm / 5) / (this.levelElapsedSeconds / 60));
        }

        this.updateHUDStats();
    }

    pauseGame() {
        if (this.state === 'PLAYING') {
            this.changeState('PAUSED');
        }
    }

    resumeGame() {
        if (this.state === 'PAUSED') {
            this.changeState('PLAYING');
            this.lastFrameTime = performance.now();
        }
    }

    restartLevel() {
        this.startLevel(this.currentLevel);
    }

    /**
     * Active Word spawner
     */
    loadNewWord() {
        this.currentWord = this.wordManager.getWordForLevel(this.currentLevel);
        this.typedIndex = 0;
        this.wrongLetterFlashTimer = 0;
        this.renderWordUI();
        
        if (this.progress.ttsEnabled) {
            this.pronounceWord(this.currentWord);
        }
    }

    /**
     * Unlock TTS engine on first user gesture (required by browsers)
     */
    ttsUnlock() {
        if (!('speechSynthesis' in window) || this.ttsReady) return;
        this.ttsReady = true;
        console.log('[TTS] Unlocking speech synthesis...');
        // Speak a silent utterance to unblock the audio context
        const unlock = new SpeechSynthesisUtterance(' ');
        unlock.volume = 0;
        unlock.onend = () => {
            console.log('[TTS] Unlock complete — speech synthesis is active');
            // If a word was queued before unlock, speak it now
            if (this.ttsPendingWord) {
                this.ttsSpeakNow(this.ttsPendingWord);
                this.ttsPendingWord = null;
            }
        };
        window.speechSynthesis.speak(unlock);
    }
    
    /**
     * Speak a word immediately (internal — assumes TTS is unlocked)
     */
    ttsSpeakNow(word) {
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US';
        u.rate = 0.85;
        u.pitch = 1.0;
        u.volume = 1.0;
        if (this.ttsVoice) u.voice = this.ttsVoice;
        u.onstart = () => console.log('[TTS] ▶ Speaking:', word);
        u.onend   = () => console.log('[TTS] ✓ Done:', word);
        u.onerror = (e) => {
            console.error('[TTS] ✗ Error on "' + word + '":', e.error);
            if (e.error === 'interrupted') {
                // Chrome interrupted — try once more without cancel
                setTimeout(() => {
                    const r = new SpeechSynthesisUtterance(word);
                    r.lang = 'en-US'; r.rate = 0.85;
                    if (this.ttsVoice) r.voice = this.ttsVoice;
                    window.speechSynthesis.speak(r);
                }, 200);
            }
        };
        window.speechSynthesis.speak(u);
    }
    
    /**
     * Public API: pronounce a word (handles unlock state)
     */
    pronounceWord(word) {
        if (!('speechSynthesis' in window)) return;
        
        if (!this.ttsReady) {
            // Not yet unlocked — queue the word; it will be spoken after first unlock
            this.ttsPendingWord = word;
            return;
        }
        
        // Cancel current speech cleanly, then speak the new word
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            // Wait for cancel to complete before speaking
            setTimeout(() => this.ttsSpeakNow(word), 100);
        } else {
            this.ttsSpeakNow(word);
        }
    }

    /**
     * Highlight styled letters based on typing index progress
     */
    renderWordUI() {
        let html = "";
        for (let i = 0; i < this.currentWord.length; i++) {
            const letter = this.currentWord[i];
            
            if (i < this.typedIndex) {
                // Correctly typed
                html += `<span class="letter-correct">${letter}</span>`;
            } else if (i === this.typedIndex && this.wrongLetterFlashTimer > 0) {
                // Flashing mistake red
                html += `<span class="letter-incorrect">${letter}</span>`;
            } else {
                // Future letters
                html += `<span class="letter-remaining">${letter}</span>`;
            }
        }
        
        // Add cursor indicator at current typing position
        if (this.typedIndex < this.currentWord.length) {
            // Place cursor before active letter
            this.hudElements.wordDisplay.innerHTML = html.replace(
                `<span class="letter-remaining">${this.currentWord[this.typedIndex]}</span>`,
                `<span class="typing-cursor"></span><span class="letter-remaining">${this.currentWord[this.typedIndex]}</span>`
            );
        } else {
            // Placed at end
            this.hudElements.wordDisplay.innerHTML = html + `<span class="typing-cursor"></span>`;
        }
    }

    /**
     * Handle typing input keypresses
     */
    handleKeyDown(e) {
        if (this.state !== 'PLAYING') return;

        // Skip utility keys or modifiers
        if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
            // Support Escape key to pause
            if (e.key === 'Escape') {
                this.pauseGame();
            }
            return;
        }

        const key = e.key.toLowerCase();
        
        // Allow alphabet characters only
        if (!/^[a-z]$/.test(key)) return;
        
        e.preventDefault(); // Stop spacebar scrolling, etc.
        this.totalKeystrokes++;

        const targetLetter = this.currentWord[this.typedIndex].toLowerCase();
        
        // Provide visual key flash trigger
        this.triggerVirtualKeyboardHighlight(key, key === targetLetter);

        if (key === targetLetter) {
            // --- CORRECT KEY STROKE ---
            this.typedIndex++;
            this.correctKeystrokes++;
            this.correctLettersForWpm++;
            this.wrongLetterFlashTimer = 0;
            
            // Audio type click sound
            if (window.audioSynth) window.audioSynth.playClick();
            
            // Check if full word complete
            if (this.typedIndex >= this.currentWord.length) {
                this.executePlayerAttack();
            } else {
                this.renderWordUI();
            }
        } else {
            // --- INCORRECT KEY STROKE ---
            this.combo = 0; // Combo breaks!
            this.wrongLetterFlashTimer = 8; // Flash red letter frames
            
            if (window.audioSynth) window.audioSynth.playError();
            
            // Charging the enemy attack as a punishment for mistake
            const config = this.levelConfigs[this.currentLevel - 1];
            // Increase enemy charge by 12% of total cooldown
            this.enemyAttackCharge = Math.min(1.0, this.enemyAttackCharge + 0.12);
            
            // Surge enemy forward immediately as punishment for mistake
            this.enemy.x = Math.max(300, this.enemy.x - 20);
            
            this.renderWordUI();
            this.updateHUDStats();
        }
    }

    /**
     * Match physical keys to visual keyboard rows in the bottom overlay
     */
    triggerVirtualKeyboardHighlight(key, isCorrect) {
        const keyEl = document.getElementById(`key-${key}`);
        if (!keyEl) return;
        
        keyEl.classList.remove('active', 'error');
        // Force reflow for repeat key tap animations
        void keyEl.offsetWidth;
        
        keyEl.classList.add(isCorrect ? 'active' : 'error');
        
        // Strip tags after animation duration
        setTimeout(() => {
            keyEl.classList.remove('active', 'error');
        }, 150);
    }

    /**
     * Player completes typing word -> attacks enemy
     */
    executePlayerAttack() {
        const config = this.levelConfigs[this.currentLevel - 1];
        
        // 1. Calculate Combo multiplier and damage numbers
        this.combo++;
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        let comboMult = 1.0;
        let isCrit = false;
        let particleColor = '#00f0ff'; // Cyan default
        
        if (this.combo >= 20) {
            comboMult = 2.0;
            isCrit = true;
            particleColor = '#9d00ff'; // Purple critical
        } else if (this.combo >= 10) {
            comboMult = 1.5;
            particleColor = '#ff007f'; // Pink highlight
        } else if (this.combo >= 5) {
            comboMult = 1.2;
        }

        // Damage formula scales on word characters length, level, and combos
        let baseDmg = this.currentWord.length * 2.5 + (this.currentLevel * 0.5);
        let finalDamage = Math.round(baseDmg * comboMult);
        
        // 2. Adjust for Enemy Blocking
        const isBlocked = Math.random() < config.enemyBlockChance;
        if (isBlocked && this.enemy.state !== 'hurt' && this.enemy.state !== 'death') {
            // Block state reduces regular hits damage, crits bypass block
            if (isCrit) {
                finalDamage = Math.round(finalDamage * 0.8); // crits slightly affected
                this.enemy.changeState('hurt', 25);
                this.renderer.spawnFloatingText(this.enemy.x, 340, "BLOCK BROKEN!", '#ffd700', 16, true);
            } else {
                finalDamage = Math.round(finalDamage * 0.4); // 60% damage blocked
                this.enemy.changeState('block', 25);
                this.renderer.spawnFloatingText(this.enemy.x, 340, "BLOCKED!", '#8b88a1', 16, false);
            }
        } else {
            // Standard enemy hurt transition
            this.enemy.changeState('hurt', 25);
        }

        // Apply Damage
        this.enemy.hp = Math.max(0, this.enemy.hp - finalDamage);
        this.totalDamageDealt += finalDamage;
        this.score += Math.round(finalDamage * 10 * this.accuracy/100);

        // 3. Spawns visual effects: spark particles, slashes, screen shakes, floating scores
        this.player.changeState('attack', 25);
        
        // Spawn sword slash on enemy
        this.renderer.spawnSlash(this.enemy.x - 30, 400, 1, particleColor);
        // Sparks bounce from enemy location
        this.renderer.spawnSparks(this.enemy.x, 400, particleColor, isCrit ? 25 : 12);
        
        // Damage floating tag
        const damageText = (isCrit ? "CRIT " : "") + `-${finalDamage}`;
        this.renderer.spawnFloatingText(
            this.enemy.x, 
            360, 
            damageText, 
            isCrit ? '#ffbb00' : (isBlocked ? '#8b88a1' : '#ffffff'), 
            isCrit ? 30 : 22, 
            isCrit
        );

        if (isCrit) {
            // Critical screenshake
            this.renderer.triggerShake(15, 8);
        }

        // Play blade audio
        if (window.audioSynth) window.audioSynth.playHit();
        
        // 4. Boost energy bars
        this.playerEnergy = Math.min(100, this.playerEnergy + 8 + this.currentWord.length * 0.5);

        // Reset enemy attack charge bar slightly on heavy player hits (gives player advantage)
        this.enemyAttackCharge = Math.max(0, this.enemyAttackCharge - 0.08);

        // Push the enemy back (capped at start position 804)
        // Bonus pushback for high combos!
        const pushbackBase = 45 + this.currentWord.length * 5;
        const comboBonus = this.combo >= 20 ? 1.3 : (this.combo >= 10 ? 1.15 : 1.0);
        const finalPushback = pushbackBase * comboBonus;
        this.enemy.x = Math.min(804, this.enemy.x + finalPushback);

        // Check Victory
        if (this.enemy.hp <= 0) {
            this.resolveLevelEnd(true);
            return;
        }

        // Spawn next spelling word
        this.loadNewWord();
        this.updateHPBars();
        this.updateHUDStats();
    }

    /**
     * Enemy AI attack execution
     */
    executeEnemyAttack() {
        if (this.state !== 'PLAYING' || this.enemy.hp <= 0) return;
        
        const config = this.levelConfigs[this.currentLevel - 1];
        
        // Enemy strikes player
        this.enemy.changeState('attack', 30);
        this.player.changeState('hurt', 25);
        
        // Reset typing index and trigger error audio
        this.combo = 0;
        this.typedIndex = 0;
        this.wrongLetterFlashTimer = 0;
        
        // Heavy audio blunt impact
        if (window.audioSynth) window.audioSynth.playPunch();
        
        // Spawns visuals on player
        this.renderer.spawnSlash(this.player.x + 30, 400, -1, '#ff5d00');
        this.renderer.spawnSparks(this.player.x, 400, '#ff5d00', 15);
        this.renderer.triggerShake(20, 10);
        
        const finalDamage = Math.round(config.enemyDamage);
        this.player.hp = Math.max(0, this.player.hp - finalDamage);
        
        // Floating damage indicator
        this.renderer.spawnFloatingText(this.player.x, 360, `-${finalDamage}`, '#ff3b30', 22, false);
        
        // Check Defeat
        if (this.player.hp <= 0) {
            this.resolveLevelEnd(false);
            return;
        }

        // Restart active word
        this.renderWordUI();
        this.updateHPBars();
        this.updateHUDStats();
    }

    /**
     * Resolve Level complete (victory/defeat)
     */
    resolveLevelEnd(isPlayerVictory) {
        if (this.state !== 'PLAYING') return;
        
        if (this.levelTimerInterval) clearInterval(this.levelTimerInterval);
        
        if (isPlayerVictory) {
            this.enemy.changeState('death', 100);
            
            // Calculate Stars rating based on Word typing accuracy and speed metrics
            let earnedStars = 1;
            const thresholds = this.levelConfigs[this.currentLevel - 1].starsThresholds;
            
            if (this.wpm >= thresholds[3] && this.accuracy >= 92) {
                earnedStars = 3;
            } else if (this.wpm >= thresholds[2] && this.accuracy >= 80) {
                earnedStars = 2;
            }
            
            // Save level progression
            if (this.currentLevel === this.progress.unlockedLevel && this.currentLevel < 20) {
                this.progress.unlockedLevel = this.currentLevel + 1;
            }
            
            // Highscore stars update
            const prevStars = this.progress.stars[this.currentLevel] || 0;
            if (earnedStars > prevStars) {
                this.progress.stars[this.currentLevel] = earnedStars;
            }
            this.saveProgress();
            
            // Play victory jingle
            if (window.audioSynth) window.audioSynth.playVictory();
            
            this.showResultsScreen(true, earnedStars);
        } else {
            this.player.changeState('death', 100);
            
            // Play defeat jingle
            if (window.audioSynth) window.audioSynth.playDefeat();
            
            this.showResultsScreen(false, 0);
        }
    }

    // (Deprecated level timeout checks)

    showResultsScreen(isWin, starsCount) {
        // UI text bindings
        const rTitle = document.getElementById('results-title');
        rTitle.className = `results-title ${isWin ? 'win' : 'lose'}`;
        rTitle.innerText = isWin ? "VICTORY" : "DEFEATED";
        
        // Show stars
        const starsContainer = document.getElementById('results-stars-container');
        starsContainer.innerHTML = "";
        for (let s = 1; s <= 3; s++) {
            const star = document.createElement('span');
            star.className = `big-star ${s <= starsCount ? 'active' : ''}`;
            star.innerText = "★";
            starsContainer.appendChild(star);
        }
        
        // Stats grid bindings
        document.getElementById('res-lvl').innerText = this.currentLevel;
        document.getElementById('res-wpm').innerText = this.wpm;
        document.getElementById('res-accuracy').innerText = this.accuracy + "%";
        document.getElementById('res-combo').innerText = this.maxCombo;
        document.getElementById('res-damage').innerText = this.totalDamageDealt;
        document.getElementById('res-score').innerText = this.score;
        
        // Configure transition buttons
        const btnNext = document.getElementById('btn-results-next');
        if (isWin && this.currentLevel < 20) {
            btnNext.style.display = "block";
        } else {
            btnNext.style.display = "none";
        }
        
        this.changeState('RESULTS');
    }

    /**
     * Draw frame rendering pipeline
     */
    gameLoop(time) {
        const delta = time - this.lastFrameTime;
        this.lastFrameTime = time;
        
        // Update character positions/actions
        if (this.state === 'PLAYING') {
            const config = this.levelConfigs[this.currentLevel - 1];
            
            // Advance character sprites
            this.player.update();
            this.enemy.update();
            
            // Continuous enemy advancement towards the player boundary (x=300)
            if (this.enemy.state !== 'hurt' && this.enemy.state !== 'death' && this.player.state !== 'death') {
                const elapsedSec = delta / 1000;
                this.enemy.x = Math.max(300, this.enemy.x - this.enemySpeed * elapsedSec);
            }
            
            // Check if enemy reaches player
            if (this.enemy.x <= 300 && this.enemy.state !== 'death' && this.player.state !== 'death') {
                this.resolveLevelEnd(false); // Defeated!
            }
            
            // Advance visual effects (sparks, slashes, numbers)
            this.renderer.update();
            
            // Accumulate enemy AI attack charge
            this.enemyAttackCharge += delta / config.enemyAttackCooldown;
            if (this.enemyAttackCharge >= 1.0) {
                this.enemyAttackCharge = 0;
                this.executeEnemyAttack();
            }
            
            // Animate error typing letter flash timer
            if (this.wrongLetterFlashTimer > 0) {
                this.wrongLetterFlashTimer--;
                if (this.wrongLetterFlashTimer === 0) {
                    this.renderWordUI();
                }
            }
        }
        
        // Render Canvas layers
        this.renderer.draw(this.player, this.enemy, this.currentLevel);
        
        // Loops
        window.requestAnimationFrame((time) => this.gameLoop(time));
    }

    // ==========================================
    // UI HUD UPDATES
    // ==========================================

    updateHPBars() {
        if (!this.player || !this.enemy) return;
        
        // Player HP
        const playerHpPercent = (this.player.hp / this.player.maxHp) * 100;
        this.hudElements.playerHpBar.style.width = `${playerHpPercent}%`;
        this.hudElements.playerHpText.innerText = `${this.player.hp}/${this.player.maxHp}`;
        
        // Slow transition bar effect
        setTimeout(() => {
            if (this.hudElements.playerHpDelay) {
                this.hudElements.playerHpDelay.style.width = `${playerHpPercent}%`;
            }
        }, 150);

        // Enemy HP
        const enemyHpPercent = (this.enemy.hp / this.enemy.maxHp) * 100;
        this.hudElements.enemyHpBar.style.width = `${enemyHpPercent}%`;
        this.hudElements.enemyHpText.innerText = `${this.enemy.hp}/${this.enemy.maxHp}`;
        
        setTimeout(() => {
            if (this.hudElements.enemyHpDelay) {
                this.hudElements.enemyHpDelay.style.width = `${enemyHpPercent}%`;
            }
        }, 150);

        // Player Energy
        this.hudElements.playerEnergy.style.width = `${this.playerEnergy}%`;
    }

    updateHUDStats() {
        // Format elapsed time string MM:SS
        const minutes = Math.floor(this.levelElapsedSeconds / 60);
        const seconds = this.levelElapsedSeconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.hudElements.timer.innerText = timeString;
        
        // Toggle critical blinking red class when enemy is dangerously close (within 120px from player)
        if (this.enemy && this.enemy.x <= 420) {
            this.hudElements.timer.classList.add('timer-critical');
        } else {
            this.hudElements.timer.classList.remove('timer-critical');
        }

        this.hudElements.levelText.innerText = `LEVEL ${this.currentLevel}`;
        this.hudElements.enemyName.innerText = this.enemyName;
        
        // Accuracy
        if (this.totalKeystrokes > 0) {
            this.accuracy = Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100);
        } else {
            this.accuracy = 100;
        }
        this.hudElements.accuracy.innerText = this.accuracy + "%";
        
        // WPM & Score
        this.hudElements.wpm.innerText = this.wpm;
        this.hudElements.score.innerText = this.score;

        // Combos Indicators
        if (this.combo > 0) {
            this.hudElements.comboCount.innerText = this.combo;
            this.hudElements.comboCount.style.display = "block";
            this.hudElements.comboLabel.style.display = "block";
            
            // Multiplier labels
            if (this.combo >= 20) {
                this.hudElements.comboMult.innerText = "2.0x CRIT";
                this.hudElements.comboMult.style.color = "var(--neon-purple)";
            } else if (this.combo >= 10) {
                this.hudElements.comboMult.innerText = "1.5x";
                this.hudElements.comboMult.style.color = "var(--neon-pink)";
            } else if (this.combo >= 5) {
                this.hudElements.comboMult.innerText = "1.2x";
                this.hudElements.comboMult.style.color = "var(--neon-green)";
            } else {
                this.hudElements.comboMult.innerText = "";
            }
        } else {
            this.hudElements.comboCount.style.display = "none";
            this.hudElements.comboLabel.style.display = "none";
            this.hudElements.comboMult.innerText = "";
        }
    }
}

// Bind to window to launch on load
window.addEventListener('load', () => {
    window.gameCtrl = new GameController();
    window.gameCtrl.init();
});
