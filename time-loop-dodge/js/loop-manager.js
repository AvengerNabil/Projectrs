/**
 * Time Loop Dodge - Loop Manager
 * Manages the time loop mechanics and reset system
 */

class LoopManager {
    constructor(initialDuration = 10000) {
        // Validate input
        if (typeof initialDuration !== 'number' || initialDuration <= 0) {
            throw new Error('LoopManager: initialDuration must be a positive number');
        }

        this.loopDuration = initialDuration; // milliseconds
        this.timeRemaining = this.loopDuration;
        this.loopCount = 0;
        this.timeSinceLastLoop = 0;
        this.isResetting = false;
        this.resetCooldown = 0;

        // Difficulty scaling
        this.minDuration = 3000; // Minimum 3 seconds
        this.durationDecrement = 200; // Decrease by 200ms each loop
        this.maxLoops = 35; // Max difficulty at 35 loops
    }

    /**
     * Update loop timer
     * @param {number} deltaTime - Time in milliseconds since last frame
     */
    update(deltaTime) {
        if (typeof deltaTime !== 'number') {
            console.warn('LoopManager.update: deltaTime is not a number', deltaTime);
            deltaTime = 16; // Default to 60fps
        }

        if (this.isResetting) {
            this.resetCooldown -= deltaTime;
            if (this.resetCooldown <= 0) {
                this.isResetting = false;
            }
            return;
        }

        this.timeRemaining -= deltaTime;
        this.timeSinceLastLoop += deltaTime;

        if (this.timeRemaining <= 0) {
            this.resetLoop();
        }
    }

    /**
     * Reset the loop
     * @returns {number} The new loop count
     */
    resetLoop() {
        this.isResetting = true;
        this.resetCooldown = 300; // 300ms reset animation
        this.loopCount++;
        this.updateDuration();
        this.timeRemaining = this.loopDuration;
        this.timeSinceLastLoop = 0;

        // Play sound effect
        if (typeof SoundManager !== 'undefined' && SoundManager.playLoopReset) {
            SoundManager.playLoopReset();
        }

        return this.loopCount;
    }

    /**
     * Update loop duration based on difficulty
     */
    updateDuration() {
        const newDuration = Math.max(
            this.minDuration,
            this.loopDuration - this.durationDecrement
        );
        this.loopDuration = newDuration;
    }

    /**
     * Get normalized time (0-1, where 1 = full time, 0 = no time left)
     * @returns {number} Normalized time value
     */
    getNormalizedTime() {
        if (typeof Utils === 'undefined' || !Utils.clamp) {
            return Math.max(0, Math.min(1, this.timeRemaining / this.loopDuration));
        }
        return Utils.clamp(this.timeRemaining / this.loopDuration, 0, 1);
    }

    /**
     * Get remaining time in seconds
     * @returns {number} Seconds remaining (rounded up)
     */
    getTimeInSeconds() {
        return Math.ceil(this.timeRemaining / 1000);
    }

    /**
     * Check if time is running low
     * @returns {boolean} True if less than 30% time remaining
     */
    isTimeLow() {
        return this.timeRemaining < this.loopDuration * 0.3;
    }

    /**
     * Get difficulty multiplier (1.0x to 3.0x+)
     * @returns {number} Current difficulty multiplier
     */
    getDifficultyMultiplier() {
        const progress = Math.min(this.loopCount / this.maxLoops, 1);
        return 1 + progress * 2; // 1x to 3x difficulty
    }

    /**
     * Reset to initial state
     */
    reset() {
        this.loopCount = 0;
        this.loopDuration = 10000;
        this.timeRemaining = this.loopDuration;
        this.timeSinceLastLoop = 0;
        this.isResetting = false;
        this.resetCooldown = 0;
    }

    /**
     * Set custom initial duration
     * @param {number} duration - Duration in milliseconds
     */
    setDuration(duration) {
        if (typeof duration !== 'number' || duration <= 0) {
            console.warn('LoopManager.setDuration: Invalid duration', duration);
            return;
        }
        this.loopDuration = duration;
        this.timeRemaining = duration;
    }

    /**
     * Get current loop info as object
     * @returns {Object} Loop status information
     */
    getStatus() {
        return {
            loopCount: this.loopCount,
            timeRemaining: this.timeRemaining,
            loopDuration: this.loopDuration,
            normalizedTime: this.getNormalizedTime(),
            timeInSeconds: this.getTimeInSeconds(),
            isTimeLow: this.isTimeLow(),
            isResetting: this.isResetting,
            difficultyMultiplier: this.getDifficultyMultiplier(),
        };
    }
}

// Verify class exists
if (typeof LoopManager === 'undefined') {
    console.error('CRITICAL: LoopManager class not defined!');
}