/**
 * Time Loop Dodge - Main Game Engine
 * Core game loop and logic
 */

class Game {
    constructor() {
        try {
            // Canvas setup
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('Canvas element not found - check HTML id="gameCanvas"');
            }

            this.ctx = this.canvas.getContext('2d');
            if (!this.ctx) {
                throw new Error('Cannot get 2D context from canvas');
            }

            // Set canvas size
            this.canvasWidth = this.canvas.width = window.innerWidth;
            this.canvasHeight = this.canvas.height = window.innerHeight;

            // Game states
            this.gameState = 'START'; // START, PLAYING, PAUSED, GAME_OVER
            this.lastFrameTime = Date.now();
            this.deltaTime = 0;

            // Initialize loop manager with error handling
            if (typeof LoopManager === 'undefined') {
                throw new Error('LoopManager class not loaded - check js/loop-manager.js');
            }
            this.loopManager = new LoopManager(10000);

            // Initialize particle system with error handling
            if (typeof ParticleSystem === 'undefined') {
                throw new Error('ParticleSystem class not loaded - check js/particle.js');
            }
            this.particleSystem = new ParticleSystem();

            // Game systems
            this.player = null;
            this.obstacles = [];

            // Game mechanics
            this.score = 0;
            this.combo = 0;
            this.maxCombo = 0;
            this.gameSpeed = 1;
            this.maxGameSpeed = 2.5;
            this.screenShakeIntensity = 0;
            this.difficulty = 'normal';

            // Settings
            this.soundEnabled = true;
            this.glitchEnabled = true;
            this.particlesEnabled = true;
            this.screenShakeEnabled = true;

            // Input handling
            this.keys = {};
            this.touchStartX = 0;
            this.touchStartY = 0;
            this.touchStartTime = 0;
            this.doubleTapTime = 0;
            this.touchDirection = null;

            // FPS tracking
            this.frameCount = 0;
            this.fps = 60;
            this.fpsUpdateTime = 0;

            console.log('✓ Game constructor initialized successfully');
            this.init();

        } catch (error) {
            console.error('CRITICAL ERROR in Game constructor:', error);
            console.error('Stack:', error.stack);
            alert('GAME ERROR: ' + error.message + '\n\nCheck browser console (F12) for details.');
            throw error;
        }
    }

    /**
     * Initialize the game
     */
    init() {
        try {
            this.setupEventListeners();
            
            // Create player with error handling
            if (typeof Player === 'undefined') {
                throw new Error('Player class not loaded - check js/player.js');
            }
            
            this.player = new Player(
                this.canvasWidth / 2,
                this.canvasHeight / 2,
                this.canvasWidth,
                this.canvasHeight
            );
            
            this.updateHUD();

            if (Utils.isMobile()) {
                const mobileControls = document.getElementById('mobileControls');
                if (mobileControls) {
                    mobileControls.classList.remove('hidden');
                    this.setupMobileControls();
                }
            }

            console.log('✓ Game initialization complete');
        } catch (error) {
            console.error('ERROR in Game.init():', error);
            alert('INITIALIZATION ERROR: ' + error.message);
        }
    }

    /**
     * Safe DOM element getter
     */
    getElement(id) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`⚠ Element not found: #${id}`);
            return null;
        }
        return el;
    }

    /**
     * Setup event listeners with error handling
     */
    setupEventListeners() {
        console.log('Setting up event listeners...');

        try {
            // Keyboard
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            document.addEventListener('keyup', (e) => this.handleKeyUp(e));

            // Touch
            document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
            document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
            document.addEventListener('touchend', (e) => this.handleTouchEnd(e));

            // UI Buttons - with null checks
            const startBtn = this.getElement('startBtn');
            if (startBtn) startBtn.addEventListener('click', () => this.startGame());

            const pauseBtn = this.getElement('pauseBtn');
            if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());

            const resumeBtn = this.getElement('resumeBtn');
            if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());

            const pauseRestartBtn = this.getElement('pauseRestartBtn');
            if (pauseRestartBtn) pauseRestartBtn.addEventListener('click', () => this.restart());

            const restartBtn = this.getElement('restartBtn');
            if (restartBtn) restartBtn.addEventListener('click', () => this.restart());

            const homeBtn = this.getElement('homeBtn');
            if (homeBtn) homeBtn.addEventListener('click', () => this.goToStart());

            const settingsBtn = this.getElement('settingsBtn');
            if (settingsBtn) settingsBtn.addEventListener('click', () => this.showSettings());

            const backBtn = this.getElement('backBtn');
            if (backBtn) backBtn.addEventListener('click', () => this.hideSettings());

            const soundBtn = this.getElement('soundBtn');
            if (soundBtn) soundBtn.addEventListener('click', () => this.toggleSound());

            // Settings - with null checks
            const soundToggle = this.getElement('soundToggle');
            if (soundToggle) {
                soundToggle.addEventListener('change', (e) => {
                    if (typeof SoundManager !== 'undefined') {
                        SoundManager.toggle();
                    }
                });
            }

            const glitchToggle = this.getElement('glitchToggle');
            if (glitchToggle) {
                glitchToggle.addEventListener('change', (e) => {
                    this.glitchEnabled = e.target.checked;
                    localStorage.setItem('timeLoopDodge_glitch', e.target.checked);
                });
            }

            const particlesToggle = this.getElement('particlesToggle');
            if (particlesToggle) {
                particlesToggle.addEventListener('change', (e) => {
                    this.particleSystem.toggle();
                });
            }

            const screenShakeToggle = this.getElement('screenShakeToggle');
            if (screenShakeToggle) {
                screenShakeToggle.addEventListener('change', (e) => {
                    this.screenShakeEnabled = e.target.checked;
                    localStorage.setItem('timeLoopDodge_screenShake', e.target.checked);
                });
            }

            // Difficulty selector - with null check
            const difficultyBtns = document.querySelectorAll('.difficulty-btn');
            if (difficultyBtns && difficultyBtns.length > 0) {
                difficultyBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        difficultyBtns.forEach(b => b.removeAttribute('active'));
                        e.target.setAttribute('active', '');
                        this.difficulty = e.target.dataset.difficulty;
                    });
                });
            }

            // Difficulty select in settings
            const difficultySelect = this.getElement('difficultySelect');
            if (difficultySelect) {
                difficultySelect.addEventListener('change', (e) => {
                    this.setDifficulty(e.target.value);
                });
            }

            // Window resize
            window.addEventListener('resize', () => this.handleResize());

            console.log('✓ Event listeners set up successfully');
        } catch (error) {
            console.error('ERROR setting up event listeners:', error);
            throw error;
        }
    }

    /**
     * Setup mobile controls
     */
    setupMobileControls() {
        const dPadButtons = document.querySelectorAll('.d-pad-btn');
        dPadButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMobileDirectionStart(direction);
            });
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.handleMobileDirectionEnd();
            });
        });

        const sprintBtn = this.getElement('sprintBtn');
        if (sprintBtn) {
            sprintBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys['Sprint'] = true;
            });
            sprintBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys['Sprint'] = false;
            });
        }
    }

    /**
     * Handle mobile direction start
     */
    handleMobileDirectionStart(direction) {
        this.keys['Direction'] = direction;
    }

    /**
     * Handle mobile direction end
     */
    handleMobileDirectionEnd() {
        delete this.keys['Direction'];
    }

    /**
     * Handle keyboard down
     */
    handleKeyDown(e) {
        this.keys[e.key] = true;

        if (e.key === 'Escape') {
            this.togglePause();
        }
    }

    /**
     * Handle keyboard up
     */
    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        if (this.gameState !== 'PLAYING') return;

        const now = Date.now();
        const isDoubleTap = now - this.doubleTapTime < 300;
        this.doubleTapTime = now;

        if (isDoubleTap) {
            this.keys['Sprint'] = true;
        }

        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = now;
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        if (this.gameState !== 'PLAYING') return;

        const deltaX = e.touches[0].clientX - this.touchStartX;
        const deltaY = e.touches[0].clientY - this.touchStartY;

        const threshold = 30;
        if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
            const angle = Math.atan2(deltaY, deltaX);
            this.touchDirection = angle;
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        if (this.gameState !== 'PLAYING') return;

        this.keys['Sprint'] = false;
        this.touchDirection = null;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.canvasWidth = this.canvas.width = window.innerWidth;
        this.canvasHeight = this.canvas.height = window.innerHeight;

        if (this.player) {
            this.player.canvasWidth = this.canvasWidth;
            this.player.canvasHeight = this.canvasHeight;
        }
    }

    /**
     * Toggle sound
     */
    toggleSound() {
        if (typeof SoundManager === 'undefined') return;
        
        SoundManager.toggle();
        const btn = this.getElement('soundBtn');
        if (btn) {
            if (SoundManager.enabled) {
                btn.classList.remove('muted');
            } else {
                btn.classList.add('muted');
            }
        }
    }

    /**
     * Set difficulty
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        switch (difficulty) {
            case 'easy':
                this.loopManager = new LoopManager(15000);
                this.loopManager.minDuration = 5000;
                break;
            case 'normal':
                this.loopManager = new LoopManager(10000);
                this.loopManager.minDuration = 3000;
                break;
            case 'hard':
                this.loopManager = new LoopManager(8000);
                this.loopManager.minDuration = 2000;
                break;
            case 'hardcore':
                this.loopManager = new LoopManager(6000);
                this.loopManager.minDuration = 1500;
                break;
        }
    }

    /**
     * Start the game
     */
    startGame() {
        try {
            this.gameState = 'PLAYING';
            this.resetGameState();
            
            const startMenu = this.getElement('startMenu');
            if (startMenu) startMenu.classList.add('hidden');
            
            const pauseMenu = this.getElement('pauseMenu');
            if (pauseMenu) pauseMenu.classList.add('hidden');
            
            this.setDifficulty(this.difficulty);
            console.log('✓ Game started');
        } catch (error) {
            console.error('ERROR starting game:', error);
        }
    }

    /**
     * Toggle pause
     */
    togglePause() {
        try {
            if (this.gameState === 'PLAYING') {
                this.gameState = 'PAUSED';
                const pauseMenu = this.getElement('pauseMenu');
                if (pauseMenu) {
                    pauseMenu.classList.remove('hidden');
                    this.updatePauseMenu();
                }
            } else if (this.gameState === 'PAUSED') {
                this.gameState = 'PLAYING';
                const pauseMenu = this.getElement('pauseMenu');
                if (pauseMenu) pauseMenu.classList.add('hidden');
                this.lastFrameTime = Date.now();
            }
        } catch (error) {
            console.error('ERROR toggling pause:', error);
        }
    }

    /**
     * Update pause menu
     */
    updatePauseMenu() {
        const pauseScore = this.getElement('pauseScore');
        if (pauseScore) pauseScore.textContent = Utils.formatNumber(Math.floor(this.score));

        const pauseLoops = this.getElement('pauseLoops');
        if (pauseLoops) pauseLoops.textContent = this.loopManager.loopCount;

        const pauseDifficulty = this.getElement('pauseDifficulty');
        if (pauseDifficulty) pauseDifficulty.textContent = this.loopManager.getDifficultyMultiplier().toFixed(1) + 'x';
    }

    /**
     * Show settings
     */
    showSettings() {
        const pauseMenu = this.getElement('pauseMenu');
        if (pauseMenu) pauseMenu.classList.add('hidden');

        const settingsMenu = this.getElement('settingsMenu');
        if (settingsMenu) settingsMenu.classList.remove('hidden');
    }

    /**
     * Hide settings
     */
    hideSettings() {
        const settingsMenu = this.getElement('settingsMenu');
        if (settingsMenu) settingsMenu.classList.add('hidden');

        const pauseMenu = this.getElement('pauseMenu');
        if (pauseMenu) pauseMenu.classList.remove('hidden');
    }

    /**
     * Restart the game
     */
    restart() {
        try {
            this.gameState = 'PLAYING';
            this.resetGameState();
            this.player = new Player(
                this.canvasWidth / 2,
                this.canvasHeight / 2,
                this.canvasWidth,
                this.canvasHeight
            );

            const gameOverMenu = this.getElement('gameOverMenu');
            if (gameOverMenu) gameOverMenu.classList.add('hidden');

            const pauseMenu = this.getElement('pauseMenu');
            if (pauseMenu) pauseMenu.classList.add('hidden');

            const startMenu = this.getElement('startMenu');
            if (startMenu) startMenu.classList.add('hidden');

            console.log('✓ Game restarted');
        } catch (error) {
            console.error('ERROR restarting game:', error);
        }
    }

    /**
     * Go to start
     */
    goToStart() {
        try {
            this.gameState = 'START';
            
            const gameOverMenu = this.getElement('gameOverMenu');
            if (gameOverMenu) gameOverMenu.classList.add('hidden');

            const startMenu = this.getElement('startMenu');
            if (startMenu) startMenu.classList.remove('hidden');

            console.log('✓ Returned to start menu');
        } catch (error) {
            console.error('ERROR going to start:', error);
        }
    }

    /**
     * Reset game state
     */
    resetGameState() {
        try {
            this.score = 0;
            this.combo = 0;
            this.maxCombo = 0;
            this.gameSpeed = 1;
            this.obstacles = [];
            this.particleSystem.clear();
            this.loopManager.reset();
            this.screenShakeIntensity = 0;
            this.updateHUD();
        } catch (error) {
            console.error('ERROR resetting game state:', error);
        }
    }

    /**
     * Update HUD with error handling
     */
    updateHUD() {
        try {
            const scoreValue = this.getElement('scoreValue');
            if (scoreValue && this.player) {
                scoreValue.textContent = Utils.formatNumber(Math.floor(this.score));
            }

            const loopCount = this.getElement('loopCount');
            if (loopCount) {
                loopCount.textContent = this.loopManager.loopCount;
            }

            const comboValue = this.getElement('comboValue');
            if (comboValue) {
                comboValue.textContent = Math.floor(this.combo) + 'x';
            }

            const timeValue = this.getElement('timeValue');
            if (timeValue) {
                timeValue.textContent = this.loopManager.getTimeInSeconds() + 's';
            }

            // Update timer bar animation
            const timerBar = document.querySelector('#timerBar');
            if (timerBar) {
                const percentage = this.loopManager.getNormalizedTime() * 100;
                timerBar.style.width = percentage + '%';
            }

            // Update time danger state
            const timeDisplay = document.querySelector('.time-display');
            if (timeDisplay) {
                if (this.loopManager.isTimeLow()) {
                    timeDisplay.classList.add('danger');
                } else {
                    timeDisplay.classList.remove('danger');
                }
            }

            // Update lives display
            if (this.player) {
                for (let i = 1; i <= 3; i++) {
                    const lifeDot = this.getElement('life' + i);
                    if (lifeDot) {
                        if (i <= this.player.lives) {
                            lifeDot.classList.remove('empty');
                        } else {
                            lifeDot.classList.add('empty');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('ERROR updating HUD:', error);
            // Don't throw - continue game even if HUD update fails
        }
    }

    /**
     * Handle player input
     */
    handlePlayerInput() {
        let inputX = 0;
        let inputY = 0;

        // Keyboard input
        if (this.keys['ArrowLeft'] || this.keys['a']) inputX -= 1;
        if (this.keys['ArrowRight'] || this.keys['d']) inputX += 1;
        if (this.keys['ArrowUp'] || this.keys['w']) inputY -= 1;
        if (this.keys['ArrowDown'] || this.keys['s']) inputY += 1;

        // Touch input
        if (this.touchDirection !== null && this.touchDirection !== undefined) {
            inputX = Math.cos(this.touchDirection);
            inputY = Math.sin(this.touchDirection);
        }

        // Mobile direction buttons
        if (this.keys['Direction']) {
            const direction = this.keys['Direction'];
            if (direction === 'up') inputY -= 1;
            if (direction === 'down') inputY += 1;
            if (direction === 'left') inputX -= 1;
            if (direction === 'right') inputX += 1;
        }

        const shouldSprint = this.keys[' '] || this.keys['Sprint'] || this.keys['Shift'];

        if (this.player) {
            this.player.handleInput(inputX, inputY, shouldSprint);
        }
    }

    /**
     * Spawn obstacles
     */
    spawnObstacles() {
        if (Math.random() > 0.05 * this.loopManager.getDifficultyMultiplier()) {
            return;
        }

        const margin = 50;
        const types = ['static', 'moving_h', 'moving_v', 'spike', 'growing'];
        
        // Add wall spawning at higher difficulty
        if (this.loopManager.getDifficultyMultiplier() > 1.5) {
            types.push('wall');
        }

        const type = Utils.choice(types);
        let obstacle;

        switch (type) {
            case 'static':
                obstacle = new StaticObstacle(
                    Utils.randomInt(margin, this.canvasWidth - margin),
                    Utils.randomInt(margin, this.canvasHeight - margin),
                    Utils.randomInt(25, 50),
                    Utils.randomInt(25, 50)
                );
                break;
            case 'moving_h':
                obstacle = new MovingObstacleH(
                    Utils.randomInt(50, this.canvasWidth - 100),
                    Utils.randomInt(50, this.canvasHeight - 80),
                    50,
                    30,
                    2,
                    100
                );
                break;
            case 'moving_v':
                obstacle = new MovingObstacleV(
                    Utils.randomInt(50, this.canvasWidth - 80),
                    Utils.randomInt(50, this.canvasHeight - 100),
                    30,
                    50,
                    2,
                    100
                );
                break;
            case 'spike':
                obstacle = new SpikeObstacle(
                    Utils.randomInt(margin, this.canvasWidth - margin),
                    Utils.randomInt(margin, this.canvasHeight - margin),
                    40
                );
                break;
            case 'growing':
                obstacle = new GrowingObstacle(
                    Utils.randomInt(margin + 50, this.canvasWidth - margin - 50),
                    Utils.randomInt(margin + 50, this.canvasHeight - margin - 50),
                    20
                );
                break;
            case 'wall':
                const isHorizontal = Math.random() > 0.5;
                if (isHorizontal) {
                    obstacle = new WallObstacle(0, Utils.randomInt(100, this.canvasHeight - 100), true);
                } else {
                    obstacle = new WallObstacle(Utils.randomInt(100, this.canvasWidth - 100), 0, false);
                }
                break;
        }

        if (obstacle) {
            this.obstacles.push(obstacle);
        }
    }

    /**
     * Update game objects
     */
    updateGameObjects() {
        // Update player
        if (this.player) {
            this.player.update(this.deltaTime, this.particleSystem);
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.update(this.deltaTime, this.gameSpeed);

            if (obstacle.isOffScreen(this.canvasWidth, this.canvasHeight)) {
                this.obstacles.splice(i, 1);
            }
        }

        // Update particles
        this.particleSystem.update(this.deltaTime);

        // Update game speed
        this.gameSpeed = 1 + this.loopManager.getDifficultyMultiplier() * 0.3;
    }

    /**
     * Handle collisions
     */
    handleCollisions() {
        if (!this.player) return;

        const playerHitbox = this.player.getHitbox();

        for (const obstacle of this.obstacles) {
            const obstacleHitbox = obstacle.getHitbox();

            if (Utils.rectCollision(playerHitbox, obstacleHitbox)) {
                if (this.player.invulnerableTime <= 0) {
                    const lives = this.player.takeDamage();
                    this.combo = 0;

                    // Screen shake effect
                    if (this.screenShakeEnabled) {
                        this.screenShakeIntensity = 10;
                        const container = this.getElement('gameContainer');
                        if (container) {
                            container.classList.add('screen-shake');
                            setTimeout(() => {
                                container.classList.remove('screen-shake');
                            }, 200);
                        }
                    }

                    // Particle burst
                    this.particleSystem.burst(
                        this.player.x + this.player.width / 2,
                        this.player.y + this.player.height / 2,
                        20,
                        '#ff0040',
                        { speed: 5, life: 400 }
                    );

                    if (lives <= 0) {
                        this.gameOver();
                    }
                }
            }
        }
    }

    /**
     * Update score and combo
     */
    updateScore() {
        // Base score per frame
        this.score += this.gameSpeed * 0.5;

        // Combo bonus
        this.combo += 0.01 * this.loopManager.getDifficultyMultiplier();
        this.combo = Math.min(this.combo, 99);
        this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));

        // Loop survival bonus
        this.score += this.loopManager.loopCount * 5;
    }

    /**
     * Handle loop reset
     */
    handleLoopReset() {
        if (!this.loopManager.isResetting) return;

        // Glitch effect
        if (this.glitchEnabled) {
            const glitch = this.getElement('glitchContainer');
            if (glitch) {
                glitch.classList.remove('hidden');
                setTimeout(() => glitch.classList.add('hidden'), 200);
            }
        }

        // Flash overlay
        const overlay = this.getElement('loopResetOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            setTimeout(() => overlay.classList.add('hidden'), 300);
        }

        // Particle burst at center
        this.particleSystem.burst(
            this.canvasWidth / 2,
            this.canvasHeight / 2,
            30,
            '#ff00ff',
            { speed: 4, life: 500 }
        );

        // Combo reset if too low
        if (this.combo < 1) {
            this.combo = 0;
        }
    }

    /**
     * Game over
     */
    gameOver() {
        this.gameState = 'GAME_OVER';
        
        if (typeof SoundManager !== 'undefined' && SoundManager.playGameOver) {
            SoundManager.playGameOver();
        }

        const finalScore = this.getElement('finalScore');
        if (finalScore) finalScore.textContent = Utils.formatNumber(Math.floor(this.score));

        const finalLoops = this.getElement('finalLoops');
        if (finalLoops) finalLoops.textContent = this.loopManager.loopCount;

        const maxCombo = this.getElement('maxCombo');
        if (maxCombo) maxCombo.textContent = Math.floor(this.maxCombo);

        const finalDifficulty = this.getElement('finalDifficulty');
        if (finalDifficulty) finalDifficulty.textContent = this.loopManager.getDifficultyMultiplier().toFixed(1) + 'x';

        const gameOverMenu = this.getElement('gameOverMenu');
        if (gameOverMenu) gameOverMenu.classList.remove('hidden');

        // Large particle explosion
        if (this.player) {
            this.particleSystem.burst(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                50,
                '#ff0040',
                { speed: 8, life: 600 }
            );
        }
    }

    /**
     * Draw background
     */
    drawBackground() {
        // Gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvasWidth, this.canvasHeight);
        gradient.addColorStop(0, '#0a0a14');
        gradient.addColorStop(0.5, '#151520');
        gradient.addColorStop(1, '#050508');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Grid pattern
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        const gridSize = 40;

        for (let i = 0; i <= this.canvasWidth; i += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvasHeight);
            this.ctx.stroke();
        }

        for (let i = 0; i <= this.canvasHeight; i += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvasWidth, i);
            this.ctx.stroke();
        }
    }

    /**
     * Draw game objects
     */
    drawGameObjects() {
        this.particleSystem.draw(this.ctx);

        for (const obstacle of this.obstacles) {
            obstacle.draw(this.ctx);
        }

        if (this.player) {
            this.player.draw(this.ctx);
        }
    }

    /**
     * Update FPS counter
     */
    updateFPS() {
        this.frameCount++;
        const now = Date.now();

        if (now >= this.fpsUpdateTime + 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsUpdateTime = now;
            
            const fpsDisplay = this.getElement('fpsValue');
            if (fpsDisplay) {
                fpsDisplay.textContent = this.fps + ' FPS';
            }
        }
    }

    /**
     * Main game loop
     */
    gameLoop() {
        try {
            const currentTime = Date.now();
            this.deltaTime = currentTime - this.lastFrameTime;
            this.lastFrameTime = currentTime;

            const cappedDeltaTime = Math.min(this.deltaTime, 50);

            if (this.gameState === 'PLAYING') {
                this.handlePlayerInput();
                this.loopManager.update(cappedDeltaTime);
                this.spawnObstacles();
                this.updateGameObjects();
                this.handleCollisions();
                this.updateScore();
                this.handleLoopReset();
                this.updateHUD();
            }

            this.drawBackground();
            this.drawGameObjects();
            this.updateFPS();
        } catch (error) {
            console.error('ERROR in game loop:', error);
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Start the game loop
     */
    start() {
        console.log('✓ Starting game loop...');
        this.gameLoop();
    }
}

// Initialize game when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const game = new Game();
            game.start();
        } catch (error) {
            console.error('FATAL ERROR: Could not initialize game:', error);
            alert('Failed to initialize game. See console for details.');
        }
    });
} else {
    try {
        const game = new Game();
        game.start();
    } catch (error) {
        console.error('FATAL ERROR: Could not initialize game:', error);
        alert('Failed to initialize game. See console for details.');
    }
}