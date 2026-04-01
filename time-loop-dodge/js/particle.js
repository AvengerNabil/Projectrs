/**
 * Time Loop Dodge - Particle System
 * Manages visual particle effects
 */

class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
        this.alpha = 1;
        this.friction = 0.98;
        this.gravity = 0.1;
    }

    update(deltaTime) {
        this.life -= deltaTime;
        this.alpha = Math.max(0, this.life / this.maxLife);

        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;

        this.x += this.vx;
        this.y += this.vy;
        this.size *= 0.98;
    }

    isAlive() {
        return this.life > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * Particle System
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.enabled = true;

        const saved = localStorage.getItem('timeLoopDodge_particles');
        if (saved !== null) {
            this.enabled = saved === 'true';
        }

        const toggle = document.getElementById('particlesToggle');
        if (toggle) toggle.checked = this.enabled;
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('timeLoopDodge_particles', this.enabled);
    }

    add(particle) {
        if (this.enabled) {
            this.particles.push(particle);
        }
    }

    burst(x, y, count, color, options = {}) {
        if (!this.enabled) return;

        const {
            speed = 3,
            size = 2,
            life = 500,
            angle = null,
            spread = Math.PI * 2,
        } = options;

        for (let i = 0; i < count; i++) {
            let particleAngle = angle;
            if (angle === null) {
                particleAngle = (i / count) * spread;
            } else {
                particleAngle = angle + (Math.random() - 0.5) * (spread / 2);
            }

            const vx = Math.cos(particleAngle) * speed * (0.5 + Math.random());
            const vy = Math.sin(particleAngle) * speed * (0.5 + Math.random());

            const particle = new Particle(x, y, vx, vy, color, size, life);
            this.add(particle);
        }
    }

    trail(x, y, color, count = 2) {
        if (!this.enabled) return;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 1.5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            const particle = new Particle(
                x + (Math.random() - 0.5) * 8,
                y + (Math.random() - 0.5) * 8,
                vx,
                vy,
                color,
                1 + Math.random(),
                200 + Math.random() * 100
            );
            this.add(particle);
        }
    }

    update(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);

            if (!particle.isAlive()) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (const particle of this.particles) {
            particle.draw(ctx);
        }
    }

    clear() {
        this.particles = [];
    }
}