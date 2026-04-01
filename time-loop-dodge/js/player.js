/**
 * Time Loop Dodge - Player Character
 * Handles player movement, collision, and state
 */

class Player {
    constructor(x, y, canvasWidth, canvasHeight) {
        // Position and size
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.radius = this.width / 2;

        // Canvas bounds
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Physics
        this.velocityX = 0;
        this.velocityY = 0;
        this.acceleration = 0.4;
        this.maxSpeed = 6;
        this.friction = 0.92;
        this.direction = { x: 0, y: 0 };

        // Sprint
        this.isSprinting = false;
        this.sprintPower = 100;
        this.maxSprintPower = 100;
        this.sprintCooldown = 0;
        this.sprintDuration = 0;
        this.maxSprintDuration = 1500; // 1.5 seconds

        // State
        this.isAlive = true;
        this.lives = 3;
        this.invulnerableTime = 0;
        this.invulnerableDuration = 500; // 0.5 seconds

        // Visual
        this.color = '#00ffff';
        this.glowColor = '#00ffff';
        this.rotation = 0;
        this.trailCounter = 0;

        // Input
        this.inputX = 0;
        this.inputY = 0;
    }

    /**
     * Handle keyboard input
     */
    handleInput(inputX, inputY, shouldSprint) {
        this.inputX = inputX;
        this.inputY = inputY;

        if (shouldSprint && this.sprintPower > 0 && this.sprintCooldown <= 0) {
            this.startSprint();
        }
    }

    /**
     * Start sprinting
     */
    startSprint() {
        if (!this.isSprinting && this.sprintPower > 0) {
            this.isSprinting = true;
            this.sprintDuration = 0;
            SoundManager.playSprint();
        }
    }

    /**
     * Take damage
     */
    takeDamage() {
        if (this.invulnerableTime > 0) return; // Already invulnerable

        this.lives--;
        this.invulnerableTime = this.invulnerableDuration;
        SoundManager.playCollision();

        if (this.lives <= 0) {
            this.isAlive = false;
        }

        return this.lives;
    }

    /**
     * Update player state and physics
     */
    update(deltaTime, particleSystem) {
        if (!this.isAlive) return;

        // Calculate direction
        let inputMagnitude = Math.sqrt(this.inputX ** 2 + this.inputY ** 2);
        if (inputMagnitude > 0) {
            this.direction.x = this.inputX / inputMagnitude;
            this.direction.y = this.inputY / inputMagnitude;
            this.rotation = Math.atan2(this.direction.y, this.direction.x);
        }

        // Calculate target velocity
        let targetSpeed = this.maxSpeed;
        if (this.isSprinting && this.sprintPower > 0) {
            targetSpeed *= 1.6;
            this.sprintDuration += deltaTime;
            this.sprintPower -= deltaTime / 10;

            if (this.sprintPower <= 0) {
                this.isSprinting = false;
                this.sprintCooldown = 2000; // 2 second cooldown
            }
        } else if (!this.isSprinting) {
            // Regenerate sprint power
            if (this.sprintCooldown > 0) {
                this.sprintCooldown -= deltaTime;
            } else {
                this.sprintPower = Math.min(
                    this.maxSprintPower,
                    this.sprintPower + deltaTime / 100
                );
            }
        }

        // Apply acceleration
        const accelerationAmount = this.acceleration;
        this.velocityX += this.direction.x * accelerationAmount;
        this.velocityY += this.direction.y * accelerationAmount;

        // Clamp velocity
        const currentSpeed = Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2);
        if (currentSpeed > targetSpeed) {
            const ratio = targetSpeed / currentSpeed;
            this.velocityX *= ratio;
            this.velocityY *= ratio;
        }

        // Apply friction
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Clamp to screen bounds
        const clamped = Utils.clampPosition(
            this.x,
            this.y,
            this.width,
            this.height,
            this.canvasWidth,
            this.canvasHeight
        );
        this.x = clamped.x;
        this.y = clamped.y;

        // Update invulnerability
        if (this.invulnerableTime > 0) {
            this.invulnerableTime -= deltaTime;
        }

        // Particle trail
        if (Math.sqrt(this.velocityX ** 2 + this.velocityY ** 2) > 0.5) {
            this.trailCounter++;
            if (this.trailCounter >= 4) {
                particleSystem.trail(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.glowColor,
                    1
                );
                this.trailCounter = 0;
            }
        } else {
            this.trailCounter = 0;
        }
    }

    /**
     * Get hitbox
     */
    getHitbox() {
        return {
            x: this.x + this.width * 0.2,
            y: this.y + this.height * 0.2,
            width: this.width * 0.6,
            height: this.height * 0.6,
        };
    }

    /**
     * Draw player
     */
    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save();

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        // Draw glow
        ctx.fillStyle = this.glowColor;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius + 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw main body
        ctx.globalAlpha = this.invulnerableTime > 0 ? 0.7 : 1;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;

        // Draw square with rotation
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);

        // Main body
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Crosshair
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.width / 2 - 5, 0);
        ctx.lineTo(-this.width / 2 - 10, 0);
        ctx.moveTo(this.width / 2 + 5, 0);
        ctx.lineTo(this.width / 2 + 10, 0);
        ctx.moveTo(0, -this.height / 2 - 5);
        ctx.lineTo(0, -this.height / 2 - 10);
        ctx.moveTo(0, this.height / 2 + 5);
        ctx.lineTo(0, this.height / 2 + 10);
        ctx.stroke();

        // Sprint indicator
        if (this.sprintPower > 0) {
            const sprintPercent = this.sprintPower / this.maxSprintPower;
            ctx.strokeStyle = sprintPercent > 0.2 ?
                Utils.interpolateColor('#ff0040', '#00ff40', sprintPercent) :
                '#ff0040';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2 + 5, 0, Math.PI * 2 * sprintPercent);
            ctx.stroke();
        }

        ctx.restore();
    }
}

/**
 * Interpolate color helper
 */
Utils.interpolateColor = function(color1, color2, t) {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r = Math.round(((c1 >> 16) & 255) + t * (((c2 >> 16) & 255) - ((c1 >> 16) & 255)));
    const g = Math.round(((c1 >> 8) & 255) + t * (((c2 >> 8) & 255) - ((c1 >> 8) & 255)));
    const b = Math.round((c1 & 255) + t * ((c2 & 255) - (c1 & 255)));

    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
};