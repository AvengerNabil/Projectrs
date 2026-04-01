/**
 * Time Loop Dodge - Obstacles and Hazards
 * Different obstacle types with various behaviors
 */

class Obstacle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#ff0040';
        this.glowColor = '#ff0040';
        this.velocityX = 0;
        this.velocityY = 0;
        this.type = 'basic';
    }

    update(deltaTime, gameSpeed) {
        // Override in subclasses
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }

    isOffScreen(canvasWidth, canvasHeight) {
        return this.x + this.width < 0 || this.x > canvasWidth ||
               this.y + this.height < 0 || this.y > canvasHeight;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

/**
 * Static Obstacle
 */
class StaticObstacle extends Obstacle {
    constructor(x, y, width = 40, height = 40) {
        super(x, y, width, height);
        this.type = 'static';
        this.rotation = 0;
    }

    update(deltaTime, gameSpeed) {
        this.rotation += 0.01;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);

        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}

/**
 * Moving Obstacle (horizontal)
 */
class MovingObstacleH extends Obstacle {
    constructor(x, y, width = 50, height = 30, speed = 3, range = 100) {
        super(x, y, width, height);
        this.type = 'moving_h';
        this.speed = speed;
        this.range = range;
        this.startX = x;
        this.offset = 0;
        this.direction = 1;
    }

    update(deltaTime, gameSpeed) {
        this.offset += this.speed * this.direction * gameSpeed * 0.5;

        if (Math.abs(this.offset) > this.range) {
            this.direction *= -1;
            this.offset = Utils.clamp(this.offset, -this.range, this.range);
        }

        this.x = this.startX + this.offset;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        const pulse = Math.sin(Date.now() / 300) * 2 + 3;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(this.x - pulse, this.y - pulse, this.width + pulse * 2, this.height + pulse * 2);

        ctx.globalAlpha = 0.8;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }
}

/**
 * Moving Obstacle (vertical)
 */
class MovingObstacleV extends Obstacle {
    constructor(x, y, width = 30, height = 50, speed = 3, range = 100) {
        super(x, y, width, height);
        this.type = 'moving_v';
        this.speed = speed;
        this.range = range;
        this.startY = y;
        this.offset = 0;
        this.direction = 1;
    }

    update(deltaTime, gameSpeed) {
        this.offset += this.speed * this.direction * gameSpeed * 0.5;

        if (Math.abs(this.offset) > this.range) {
            this.direction *= -1;
            this.offset = Utils.clamp(this.offset, -this.range, this.range);
        }

        this.y = this.startY + this.offset;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        const pulse = Math.sin(Date.now() / 300) * 2 + 3;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(this.x - pulse, this.y - pulse, this.width + pulse * 2, this.height + pulse * 2);

        ctx.globalAlpha = 0.8;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }
}

/**
 * Spike Obstacle
 */
class SpikeObstacle extends Obstacle {
    constructor(x, y, size = 40) {
        super(x, y, size, size);
        this.type = 'spike';
        this.color = '#ffff00';
        this.glowColor = '#ffff00';
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = this.width / 2;

        // Draw spikes in star pattern
        const spikes = 4;
        for (let i = 0; i < spikes; i++) {
            const angle = (i / spikes) * Math.PI * 2;
            const tipX = centerX + Math.cos(angle) * radius * 1.5;
            const tipY = centerY + Math.sin(angle) * radius * 1.5;

            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(
                centerX + Math.cos(angle + 0.3) * radius,
                centerY + Math.sin(angle + 0.3) * radius
            );
            ctx.closePath();
            ctx.fill();
        }

        // Center circle
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

/**
 * Wall Obstacle (extends across screen)
 */
class WallObstacle extends Obstacle {
    constructor(x, y, isHorizontal = false) {
        if (isHorizontal) {
            super(x, y, 999, 40);
        } else {
            super(x, y, 40, 999);
        }
        this.type = 'wall';
        this.isHorizontal = isHorizontal;
        this.color = '#ff00ff';
        this.glowColor = '#ff00ff';
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        ctx.globalAlpha = 0.6;
        for (let i = 0; i < (this.isHorizontal ? 25 : 25); i++) {
            if (i % 2 === 0) {
                if (this.isHorizontal) {
                    ctx.fillRect(this.x + i * 40, this.y, 20, this.height);
                } else {
                    ctx.fillRect(this.x, this.y + i * 40, this.width, 20);
                }
            }
        }

        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.restore();
    }
}

/**
 * Growing Obstacle
 */
class GrowingObstacle extends Obstacle {
    constructor(x, y, initialSize = 20) {
        super(x, y, initialSize, initialSize);
        this.type = 'growing';
        this.initialSize = initialSize;
        this.maxSize = 100;
        this.growthRate = 0.5;
        this.color = '#ff00ff';
        this.glowColor = '#ff00ff';
    }

    update(deltaTime, gameSpeed) {
        const growth = this.growthRate * gameSpeed;
        if (this.width < this.maxSize) {
            this.width += growth;
            this.height += growth;
            this.x -= growth / 2;
            this.y -= growth / 2;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 15;

        const progress = Math.min((this.width - this.initialSize) / (this.maxSize - this.initialSize), 1);
        ctx.globalAlpha = 0.8 - progress * 0.3;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.glowColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }
}