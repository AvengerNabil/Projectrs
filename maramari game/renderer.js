// Canvas Rendering Engine for Word Warrior
class GameRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Canvas element not found: " + canvasId);
        }
        this.ctx = this.canvas.getContext('2d');
        
        // Logical Dimensions (virtual resolution 1024x640)
        this.width = 1024;
        this.height = 640;
        
        // Ground height
        this.groundY = 480;
        
        // Screen Shake
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        
        // Active visual systems
        this.particles = [];
        this.slashes = [];
        this.floatingTexts = [];
        this.bgParticles = [];
        
        // Parallax scroll offsets
        this.scrollOffset = 0;
        
        this.initBackgroundParticles();
    }

    /**
     * Set screen shake effect
     */
    triggerShake(duration = 20, intensity = 8) {
        this.shakeTimer = duration;
        this.shakeIntensity = intensity;
    }

    /**
     * Initialize background ambient particles (e.g. fireflies, ash, stardust)
     */
    initBackgroundParticles() {
        this.bgParticles = [];
        for (let i = 0; i < 40; i++) {
            this.bgParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.groundY,
                size: 1 + Math.random() * 3,
                speedY: -(0.2 + Math.random() * 0.6),
                speedX: (Math.random() - 0.5) * 0.4,
                alpha: 0.1 + Math.random() * 0.7,
                hue: 120 // green by default
            });
        }
    }

    /**
     * Spawn explosion spark particles on hit
     */
    spawnSparks(x, y, colorTheme = '#00f0ff', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (1 + Math.random() * 3), // lift upwards
                size: 2 + Math.random() * 4,
                color: colorTheme,
                alpha: 1.0,
                life: 30 + Math.random() * 20,
                gravity: 0.25,
                bounce: 0.6
            });
        }
    }

    /**
     * Spawn sword slash curve trail
     */
    spawnSlash(x, y, scale = 1, color = '#00f0ff') {
        this.slashes.push({
            x: x,
            y: y,
            scale: scale,
            color: color,
            alpha: 1.0,
            life: 15 // frames
        });
    }

    /**
     * Spawn floating text (damage/combo hits)
     */
    spawnFloatingText(x, y, text, color = '#ffffff', size = 24, isCrit = false) {
        this.floatingTexts.push({
            x: x,
            y: y - 20,
            text: text,
            color: color,
            size: size,
            isCrit: isCrit,
            vy: -1.2,
            vx: (Math.random() - 0.5) * 1.5,
            alpha: 1.0,
            life: 60 // frames
        });
    }

    /**
     * Main update call for visual systems
     */
    update() {
        // Screen shake decay
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
        }

        // Update ambient background particles
        this.bgParticles.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            if (p.y < 0) {
                p.y = this.groundY;
                p.x = Math.random() * this.width;
            }
            if (p.x < 0 || p.x > this.width) {
                p.x = Math.random() * this.width;
            }
        });

        // Update hit sparks
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;

            // Bounce on floor
            if (p.y >= this.groundY) {
                p.y = this.groundY;
                p.vy = -p.vy * p.bounce;
                p.vx *= 0.8;
            }

            p.life--;
            p.alpha = Math.max(0, p.life / 40);

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update slashes
        for (let i = this.slashes.length - 1; i >= 0; i--) {
            const s = this.slashes[i];
            s.life--;
            s.alpha = Math.max(0, s.life / 15);
            if (s.life <= 0) {
                this.slashes.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.x += t.vx;
            t.y += t.vy;
            t.vy *= 0.98; // slow down vertical rise
            t.life--;
            t.alpha = Math.max(0, t.life / 60);
            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    /**
     * Master render call
     */
    draw(player, enemy, level) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Apply screen shake
        this.ctx.save();
        if (this.shakeTimer > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
        }

        // 1. Draw Environment background based on level
        this.drawEnvironment(level);

        // 2. Draw ambient background particles
        this.drawBgParticles(level);

        // 3. Draw Floor
        this.drawFloor(level);

        // 4. Draw Characters (Player and Enemy)
        if (player) player.draw(this.ctx, this.groundY);
        if (enemy) enemy.draw(this.ctx, this.groundY);

        // 5. Draw Slash Effects
        this.drawSlashes();

        // 6. Draw Sparks
        this.drawSparks();

        // 7. Draw Floating Damage/Text
        this.drawFloatingTexts();

        this.ctx.restore();
    }

    // ==========================================
    // ENVIRONMENTAL RENDERING METHODS
    // ==========================================

    drawEnvironment(level) {
        const ctx = this.ctx;
        
        if (level >= 1 && level <= 5) {
            // Myth Forest theme
            let grad = ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, '#040b08');
            grad.addColorStop(1, '#0e2515');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Draw stylized mountains/trees
            ctx.fillStyle = '#08170e';
            ctx.beginPath();
            ctx.moveTo(0, this.groundY);
            ctx.lineTo(200, 250);
            ctx.lineTo(450, 480);
            ctx.lineTo(700, 200);
            ctx.lineTo(1024, 480);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = '#0b2014';
            ctx.beginPath();
            ctx.moveTo(0, this.groundY);
            ctx.lineTo(120, 320);
            ctx.lineTo(350, 480);
            ctx.lineTo(600, 300);
            ctx.lineTo(850, 480);
            ctx.closePath();
            ctx.fill();
            
        } else if (level >= 6 && level <= 10) {
            // Volcanic Cavern theme
            let grad = ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, '#100600');
            grad.addColorStop(1, '#331200');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Red glowing magma chamber details
            ctx.fillStyle = '#1e0c05';
            ctx.beginPath();
            ctx.moveTo(0, this.groundY);
            ctx.lineTo(150, 280);
            ctx.lineTo(320, 280);
            ctx.lineTo(500, 480);
            ctx.lineTo(750, 180);
            ctx.lineTo(1024, 480);
            ctx.closePath();
            ctx.fill();

            // Draw glowing lava river in the far background
            let magmaGrad = ctx.createLinearGradient(0, 420, 0, 480);
            magmaGrad.addColorStop(0, '#ff5500');
            magmaGrad.addColorStop(1, '#ffaa00');
            ctx.fillStyle = magmaGrad;
            ctx.fillRect(0, 430, this.width, 50);
            
        } else if (level >= 11 && level <= 15) {
            // Ruined Keep / Storm theme
            let grad = ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, '#0d0d1a');
            grad.addColorStop(1, '#1b1b36');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Draw castle pillars / battlements
            ctx.fillStyle = '#080811';
            ctx.fillRect(80, 100, 80, 380);
            ctx.fillRect(450, 120, 90, 360);
            ctx.fillRect(850, 80, 80, 400);

            ctx.fillStyle = '#111124';
            ctx.fillRect(120, 150, 60, 330);
            ctx.fillRect(810, 140, 70, 340);

            // Archways
            ctx.strokeStyle = '#1b1b36';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.arc(500, 250, 150, Math.PI, 0, false);
            ctx.stroke();

        } else {
            // Astral Rift / Cyber grid space (Levels 16-20)
            let grad = ctx.createLinearGradient(0, 0, 0, this.height);
            grad.addColorStop(0, '#05030f');
            grad.addColorStop(1, '#120524');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.width, this.height);

            // Draw a glowing grid sun
            let sunGrad = ctx.createRadialGradient(this.width/2, 280, 5, this.width/2, 280, 150);
            sunGrad.addColorStop(0, 'rgba(255, 0, 127, 0.4)');
            sunGrad.addColorStop(1, 'rgba(157, 0, 255, 0)');
            ctx.fillStyle = sunGrad;
            ctx.beginPath();
            ctx.arc(this.width/2, 280, 150, 0, Math.PI*2);
            ctx.fill();

            // Stars
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 20; i++) {
                let x = (Math.sin(i * 4543) * 0.5 + 0.5) * this.width;
                let y = (Math.cos(i * 2321) * 0.5 + 0.5) * 350;
                let size = (Math.sin(i * 123) * 0.5 + 0.5) * 2;
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    drawBgParticles(level) {
        const ctx = this.ctx;
        
        let hue = 120; // green for forest
        if (level >= 6 && level <= 10) hue = 25; // orange/red for volcanic
        if (level >= 11 && level <= 15) hue = 220; // blue for castle
        if (level >= 16) hue = 300; // purple/pink for astral

        ctx.save();
        this.bgParticles.forEach(p => {
            ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawFloor(level) {
        const ctx = this.ctx;
        const groundHeight = this.height - this.groundY;

        if (level >= 1 && level <= 5) {
            // Forest grass floor
            ctx.fillStyle = '#0f2c19';
            ctx.fillRect(0, this.groundY, this.width, groundHeight);
            ctx.fillStyle = '#1c492b';
            ctx.fillRect(0, this.groundY, this.width, 8);
        } else if (level >= 6 && level <= 10) {
            // Volcanic dark obsidian floor
            ctx.fillStyle = '#120a06';
            ctx.fillRect(0, this.groundY, this.width, groundHeight);
            
            // Lava cracks
            ctx.fillStyle = '#ff3c00';
            ctx.fillRect(100, this.groundY, 30, groundHeight);
            ctx.fillRect(400, this.groundY, 50, groundHeight);
            ctx.fillRect(750, this.groundY, 25, groundHeight);
            
            ctx.fillStyle = '#ff7700';
            ctx.fillRect(0, this.groundY, this.width, 5);
        } else if (level >= 11 && level <= 15) {
            // Gothic Stone Slab floor
            ctx.fillStyle = '#10101f';
            ctx.fillRect(0, this.groundY, this.width, groundHeight);
            
            // Stone line separations
            ctx.strokeStyle = '#1d1d36';
            ctx.lineWidth = 3;
            for (let i = 0; i < this.width; i += 60) {
                ctx.beginPath();
                ctx.moveTo(i, this.groundY);
                ctx.lineTo(i - 40, this.height);
                ctx.stroke();
            }
            ctx.fillStyle = '#26264d';
            ctx.fillRect(0, this.groundY, this.width, 6);
        } else {
            // Cyber Grid floor (Level 16-20)
            ctx.fillStyle = '#090313';
            ctx.fillRect(0, this.groundY, this.width, groundHeight);
            
            // Perspective lines
            ctx.strokeStyle = '#9d00ff';
            ctx.lineWidth = 1.5;
            
            const horizonX = this.width / 2;
            const horizonY = 380;
            
            for (let i = -200; i <= this.width + 200; i += 100) {
                ctx.beginPath();
                ctx.moveTo(horizonX, horizonY);
                ctx.lineTo(i, this.height);
                ctx.stroke();
            }

            // Horizontal grid lines compressing towards horizon
            for (let y = this.groundY; y < this.height; y += 15 + (y - this.groundY) * 0.3) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.width, y);
                ctx.stroke();
            }

            // Cyan neon border edge
            ctx.strokeStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, this.groundY);
            ctx.lineTo(this.width, this.groundY);
            ctx.stroke();
            ctx.shadowBlur = 0; // reset shadow
        }
    }

    // ==========================================
    // FX RENDERING METHODS
    // ==========================================

    drawSparks() {
        const ctx = this.ctx;
        ctx.save();
        this.particles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fill();
        });
        ctx.restore();
    }

    drawSlashes() {
        const ctx = this.ctx;
        ctx.save();
        this.slashes.forEach(s => {
            ctx.strokeStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 15;
            ctx.lineWidth = 12 * s.alpha;
            ctx.globalAlpha = s.alpha;
            
            ctx.beginPath();
            if (s.scale > 0) {
                // Player slash trail (arc swing right)
                ctx.arc(s.x, s.y, 80, -Math.PI*0.3, Math.PI*0.4, false);
            } else {
                // Enemy slash trail (arc swing left)
                ctx.arc(s.x, s.y, 80, Math.PI*0.6, Math.PI*1.3, false);
            }
            ctx.stroke();
        });
        ctx.restore();
    }

    drawFloatingTexts() {
        const ctx = this.ctx;
        ctx.save();
        this.floatingTexts.forEach(t => {
            ctx.globalAlpha = t.alpha;
            ctx.fillStyle = t.color;
            ctx.font = `${t.isCrit ? '900' : '700'} ${t.size}px 'Orbitron'`;
            ctx.textAlign = 'center';
            
            if (t.isCrit) {
                // Draw drop shadow glow for crits
                ctx.shadowColor = t.color;
                ctx.shadowBlur = 12;
            }
            ctx.fillText(t.text, t.x, t.y);
            ctx.shadowBlur = 0;
        });
        ctx.restore();
    }
}

// ==========================================
// CHARACTER MODEL CLASS
// ==========================================
class GameCharacter {
    constructor(type, x, y, isPlayer) {
        this.type = type; // 'player', 'slime', 'orc', 'darkknight', 'dragon'
        this.x = x;
        this.y = y;
        this.isPlayer = isPlayer;
        
        // Size scale (negative mirrors the drawing horizontally)
        this.scale = isPlayer ? 1 : -1;
        
        // Animation state machine: 'idle', 'attack', 'hurt', 'block', 'death'
        this.state = 'idle';
        this.stateTimer = 0;
        this.stateMaxTime = 0;
        
        // Position offsets during attacks/hurts
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Idle breathing oscillation tracker
        this.animTime = Math.random() * 100;
        
        this.maxHp = 100;
        this.hp = 100;
        
        this.colorTheme = isPlayer ? '#00f0ff' : '#ff5d00';
    }

    changeState(newState, duration = 30) {
        if (this.state === 'death') return; // Cannot change state if dead
        
        this.state = newState;
        this.stateTimer = duration;
        this.stateMaxTime = duration;
        
        if (newState === 'idle') {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }

    update() {
        this.animTime += 0.08;

        if (this.stateTimer > 0) {
            this.stateTimer--;
            
            // Set offsets based on active animation frames
            const progress = (this.stateMaxTime - this.stateTimer) / this.stateMaxTime; // 0 to 1
            
            if (this.state === 'attack') {
                if (this.isPlayer) {
                    // Lunge forward, swing, recover
                    if (progress < 0.3) {
                        this.offsetX = progress * 300; // dash in
                    } else if (progress < 0.7) {
                        this.offsetX = 90; // swing point
                    } else {
                        this.offsetX = 90 * (1 - (progress - 0.7) / 0.3); // slide back
                    }
                } else {
                    // Enemy attack lunges back then forward
                    if (progress < 0.4) {
                        this.offsetX = -progress * 150; // pull back
                    } else if (progress < 0.7) {
                        this.offsetX = 100; // strike forward
                    } else {
                        this.offsetX = 100 * (1 - (progress - 0.7) / 0.3); // back
                    }
                }
            } else if (this.state === 'hurt') {
                // Knocked back and bounce
                const knockbackDist = this.isPlayer ? -40 : -50;
                this.offsetX = knockbackDist * Math.sin(progress * Math.PI);
                this.offsetY = -15 * Math.sin(progress * Math.PI); // hop
            } else if (this.state === 'block') {
                // Brace in place
                this.offsetX = this.isPlayer ? 10 : -10;
            }
            
            if (this.stateTimer <= 0 && this.state !== 'death') {
                this.changeState('idle');
            }
        }
    }

    draw(ctx, groundY) {
        ctx.save();
        
        // Translate to character position plus dynamic animation offset
        ctx.translate(this.x + this.offsetX * (this.isPlayer ? 1 : -1), groundY + this.offsetY);
        ctx.scale(this.scale, 1); // Flip if enemy

        // Setup base rendering properties
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Flash red overlay on hurt state
        if (this.state === 'hurt') {
            ctx.shadowColor = '#ff3b30';
            ctx.shadowBlur = 15;
        }

        // Draw model based on character type
        if (this.type === 'player') {
            this.drawPlayerKnight(ctx);
        } else if (this.type === 'slime') {
            this.drawSlime(ctx);
        } else if (this.type === 'orc') {
            this.drawOrc(ctx);
        } else if (this.type === 'darkknight') {
            this.drawDarkKnight(ctx);
        } else if (this.type === 'dragon') {
            this.drawDragon(ctx);
        }

        ctx.restore();
    }

    // ==========================================
    // VECTOR MODEL DRAWING METHODS
    // ==========================================

    drawPlayerKnight(ctx) {
        // Idle breathing height offset
        const breathe = Math.sin(this.animTime) * 3;
        
        // State checks
        const isAttacking = this.state === 'attack';
        const isBlocking = this.state === 'block';
        const isDead = this.state === 'death';
        
        ctx.save();

        if (isDead) {
            ctx.translate(0, 30);
            ctx.rotate(-Math.PI * 0.45); // fall backward
        }

        // --- 1. Draw Legs ---
        ctx.fillStyle = '#2f2f3f';
        ctx.strokeStyle = '#4f4f6b';
        
        let leftLegAngle = 0;
        let rightLegAngle = 0;
        if (this.state === 'idle') {
            leftLegAngle = Math.sin(this.animTime) * 0.05;
        } else if (isAttacking) {
            leftLegAngle = -0.3;
            rightLegAngle = 0.3;
        } else if (isBlocking) {
            leftLegAngle = 0.2;
            rightLegAngle = -0.2;
        }

        // Left Leg
        ctx.save();
        ctx.translate(-15, 0);
        ctx.rotate(leftLegAngle);
        ctx.fillRect(-6, 0, 12, -30);
        ctx.strokeRect(-6, 0, 12, -30);
        ctx.restore();

        // Right Leg
        ctx.save();
        ctx.translate(15, 0);
        ctx.rotate(rightLegAngle);
        ctx.fillRect(-6, 0, 12, -30);
        ctx.strokeRect(-6, 0, 12, -30);
        ctx.restore();

        // --- 2. Draw Torso / Cape ---
        // Cape (deep red)
        ctx.fillStyle = '#7a001e';
        ctx.strokeStyle = '#4a000d';
        ctx.beginPath();
        ctx.moveTo(-15, -70 + breathe);
        ctx.lineTo(-45, -15 - breathe);
        ctx.lineTo(-10, -25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Armor Plate Torso
        ctx.fillStyle = '#6e6e85';
        ctx.strokeStyle = '#48485c';
        ctx.fillRect(-22, -80 + breathe, 44, 52);
        ctx.strokeRect(-22, -80 + breathe, 44, 52);
        
        // Chest emblem (cyan cross)
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.fillRect(-4, -68 + breathe, 8, 28);
        ctx.fillRect(-12, -60 + breathe, 24, 8);

        // --- 3. Draw Head / Helmet ---
        ctx.save();
        ctx.translate(0, -85 + breathe);
        
        // Helmet head dome
        ctx.fillStyle = '#8787a3';
        ctx.strokeStyle = '#5a5a73';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();
        
        // Visor slit
        ctx.fillStyle = '#100c22';
        ctx.fillRect(-15, -4, 30, 7);
        
        // visors glow
        if (!isDead) {
            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.fillRect(-12, -2, 24, 3);
            ctx.shadowBlur = 0; // reset glow
        }

        // Helmet Plume / Feather
        ctx.fillStyle = '#ff0055';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.quadraticCurveTo(-15, -35, -25, -20);
        ctx.quadraticCurveTo(-10, -15, 0, -20);
        ctx.fill();
        
        ctx.restore();

        // --- 4. Draw Arm Left / Shield ---
        ctx.save();
        if (isBlocking) {
            ctx.translate(25, -55 + breathe);
            ctx.rotate(-0.25);
        } else {
            ctx.translate(-25, -60 + breathe);
            ctx.rotate(0.1 + Math.sin(this.animTime) * 0.05);
        }

        // Steel Shield
        ctx.fillStyle = '#7a7a99';
        ctx.strokeStyle = '#4e4e66';
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(22, -28);
        ctx.lineTo(15, 20);
        ctx.lineTo(0, 32);
        ctx.lineTo(-15, 20);
        ctx.lineTo(-22, -28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shield Trim Gold
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();

        // --- 5. Draw Arm Right / Sword ---
        ctx.save();
        ctx.translate(20, -58 + breathe);

        let swordAngle = Math.PI * 0.1; // Default downward guard
        
        if (isBlocking) {
            swordAngle = -Math.PI * 0.15; // Raised slightly
        } else if (isAttacking) {
            // Sword swing swing animation based on timer
            const prog = (this.stateMaxTime - this.stateTimer) / this.stateMaxTime;
            if (prog < 0.4) {
                swordAngle = -Math.PI * 0.4; // cocked back
            } else if (prog < 0.7) {
                swordAngle = Math.PI * 0.6; // swung forward
            } else {
                swordAngle = Math.PI * 0.1; // return
            }
        } else if (isDead) {
            swordAngle = Math.PI * 0.7; // dropped
        }

        ctx.rotate(swordAngle);
        
        // Draw Arm
        ctx.fillStyle = '#6e6e85';
        ctx.strokeStyle = '#48485c';
        ctx.lineWidth = 3;
        ctx.fillRect(-5, -5, 24, 10);
        ctx.strokeRect(-5, -5, 24, 10);

        // Sword Hilt/Handle
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(15, -3, 8, 6);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(23, -10, 3, 20); // Guard

        // Sword Blade (Cyber Laser Neon Cyan Glow)
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = isDead ? 0 : 15;
        ctx.lineWidth = 3.5;
        
        ctx.beginPath();
        ctx.moveTo(26, -5);
        ctx.lineTo(85, -4);
        ctx.lineTo(92, 0);
        ctx.lineTo(85, 4);
        ctx.lineTo(26, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();

        ctx.restore();
    }

    drawSlime(ctx) {
        // Squish and stretch breathe cycle
        const stretchY = 1.0 + Math.sin(this.animTime * 1.5) * 0.08;
        const stretchX = 1.0 / stretchY;
        
        const isDead = this.state === 'death';
        
        ctx.save();
        
        if (isDead) {
            ctx.scale(1.5, 0.15); // Splatted slime
        } else {
            ctx.scale(stretchX, stretchY);
        }

        // Slime Body Glow
        let slimeGrad = ctx.createRadialGradient(0, -20, 5, 0, -20, 45);
        slimeGrad.addColorStop(0, '#77ff33');
        slimeGrad.addColorStop(0.7, '#22aa08');
        slimeGrad.addColorStop(1, '#0e5502');

        ctx.fillStyle = slimeGrad;
        ctx.strokeStyle = '#00ff66';
        ctx.beginPath();
        ctx.arc(0, -22, 28, 0, Math.PI, true); // Top dome
        // Bottom flat bouncy edge curves
        ctx.quadraticCurveTo(22, 0, 0, 2);
        ctx.quadraticCurveTo(-22, 0, -28, -22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw cute big yellow eyes
        if (!isDead) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(-10, -20, 4, 0, Math.PI*2);
            ctx.arc(10, -20, 4, 0, Math.PI*2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(-9, -20, 1.8, 0, Math.PI*2);
            ctx.arc(9, -20, 1.8, 0, Math.PI*2);
            ctx.fill();

            // Blush cheeks
            ctx.fillStyle = 'rgba(255, 0, 100, 0.4)';
            ctx.beginPath();
            ctx.arc(-16, -14, 3, 0, Math.PI*2);
            ctx.arc(16, -14, 3, 0, Math.PI*2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawOrc(ctx) {
        const breathe = Math.sin(this.animTime * 0.7) * 4;
        const isAttacking = this.state === 'attack';
        const isBlocking = this.state === 'block';
        const isDead = this.state === 'death';
        
        ctx.save();

        if (isDead) {
            ctx.translate(0, 35);
            ctx.rotate(-Math.PI * 0.42);
        }

        // 1. Heavy legs
        ctx.fillStyle = '#3a2414';
        ctx.fillRect(-20, 0, 14, -20);
        ctx.fillRect(8, 0, 14, -20);

        // 2. Large Torso
        let bodyGrad = ctx.createLinearGradient(-35, -75, 35, -20);
        bodyGrad.addColorStop(0, '#aa4422'); // reddish brown leathered skin
        bodyGrad.addColorStop(1, '#662208');
        ctx.fillStyle = bodyGrad;
        ctx.strokeStyle = '#3d1607';
        
        // Massive hunched back Orc shape
        ctx.beginPath();
        ctx.moveTo(-35, -20);
        ctx.lineTo(-30, -85 + breathe);
        ctx.lineTo(25, -75 + breathe);
        ctx.lineTo(30, -20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shoulder Spikes/Pads
        ctx.fillStyle = '#8a8a8a';
        ctx.beginPath();
        ctx.moveTo(-32, -85 + breathe);
        ctx.lineTo(-42, -100 + breathe);
        ctx.lineTo(-24, -90 + breathe);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3. Head (jutting forward)
        ctx.save();
        ctx.translate(18, -75 + breathe);
        ctx.fillStyle = '#803010';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();

        // Tusks/mouth
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-8, 5);
        ctx.lineTo(-12, -2);
        ctx.lineTo(-6, 2);
        ctx.moveTo(4, 6);
        ctx.lineTo(6, -1);
        ctx.lineTo(1, 3);
        ctx.fill();

        // Glowing red eyes
        if (!isDead) {
            ctx.fillStyle = '#ff3300';
            ctx.shadowColor = '#ff3300';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(-8, -4, 2, 0, Math.PI*2);
            ctx.arc(2, -4, 2, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.restore();

        // 4. Arm Left holding bronze shield
        ctx.save();
        if (isBlocking) {
            ctx.translate(35, -45 + breathe);
            ctx.rotate(0.2);
        } else {
            ctx.translate(-25, -50 + breathe);
            ctx.rotate(-0.2);
        }

        // Heavy Orc round shield
        ctx.fillStyle = '#8b5a2b'; // Wood inner
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI*2);
        ctx.fill();
        
        ctx.strokeStyle = '#cd7f32'; // Bronze rim
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Spike in center of shield
        ctx.fillStyle = '#cd853f';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI*2);
        ctx.fill();
        
        ctx.fillStyle = '#d3d3d3';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(6, 12);
        ctx.lineTo(-6, 12);
        ctx.fill();
        ctx.restore();

        // 5. Arm Right holding heavy iron spiked club
        ctx.save();
        ctx.translate(-22, -55 + breathe);
        
        let clubAngle = -Math.PI * 0.25;
        if (isAttacking) {
            const prog = (this.stateMaxTime - this.stateTimer) / this.stateMaxTime;
            if (prog < 0.4) {
                clubAngle = -Math.PI * 0.7; // Wind up
            } else if (prog < 0.7) {
                clubAngle = Math.PI * 0.35; // Strike
            }
        }
        ctx.rotate(clubAngle);

        // Wooden handle
        ctx.fillStyle = '#5c4033';
        ctx.fillRect(-4, -4, 30, 8);

        // Giant spiked club head
        ctx.fillStyle = '#404040';
        ctx.strokeStyle = '#2b2b2b';
        ctx.fillRect(26, -10, 32, 20);
        ctx.strokeRect(26, -10, 32, 20);

        // Spikes on club
        ctx.fillStyle = '#c0c0c0';
        ctx.beginPath();
        ctx.moveTo(35, -10); ctx.lineTo(37, -18); ctx.lineTo(41, -10);
        ctx.moveTo(48, -10); ctx.lineTo(50, -18); ctx.lineTo(54, -10);
        ctx.moveTo(35, 10); ctx.lineTo(37, 18); ctx.lineTo(41, 10);
        ctx.moveTo(48, 10); ctx.lineTo(50, 18); ctx.lineTo(54, 10);
        // Top tip spike
        ctx.moveTo(58, -3); ctx.lineTo(67, 0); ctx.lineTo(58, 3);
        ctx.fill();

        ctx.restore();

        ctx.restore();
    }

    drawDarkKnight(ctx) {
        const breathe = Math.sin(this.animTime * 1.1) * 3;
        const isAttacking = this.state === 'attack';
        const isBlocking = this.state === 'block';
        const isDead = this.state === 'death';

        ctx.save();
        if (isDead) {
            ctx.translate(0, 30);
            ctx.rotate(-Math.PI * 0.46);
        }

        // 1. Legs
        ctx.fillStyle = '#100e1a';
        ctx.fillRect(-14, 0, 10, -28);
        ctx.fillRect(8, 0, 10, -28);

        // 2. Torso with tattered purple cloak
        // Cloak
        ctx.fillStyle = '#3a1f5d';
        ctx.beginPath();
        ctx.moveTo(-15, -75 + breathe);
        ctx.lineTo(-40, -10 - breathe);
        ctx.lineTo(-2, -22);
        ctx.closePath();
        ctx.fill();

        // Dark armor chest plate
        let armorGrad = ctx.createLinearGradient(-20, -78, 20, -30);
        armorGrad.addColorStop(0, '#151324');
        armorGrad.addColorStop(1, '#0b0a14');
        ctx.fillStyle = armorGrad;
        ctx.strokeStyle = '#2f0066'; // Glowing purple armor lines
        ctx.fillRect(-20, -78 + breathe, 40, 50);
        ctx.strokeRect(-20, -78 + breathe, 40, 50);

        // Runes on chest
        if (!isDead) {
            ctx.fillStyle = '#9d00ff';
            ctx.shadowColor = '#9d00ff';
            ctx.shadowBlur = 8;
            ctx.fillRect(-2, -65 + breathe, 4, 12);
            ctx.shadowBlur = 0;
        }

        // 3. Head & Horned Helmet
        ctx.save();
        ctx.translate(0, -84 + breathe);
        ctx.fillStyle = '#110f1c';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI*2);
        ctx.fill();
        ctx.stroke();

        // Red glowing eyes slit
        if (!isDead) {
            ctx.fillStyle = '#ff003c';
            ctx.shadowColor = '#ff003c';
            ctx.shadowBlur = 10;
            ctx.fillRect(-10, -3, 20, 4);
            ctx.shadowBlur = 0;
        }

        // Demonic Horns
        ctx.fillStyle = '#000000';
        ctx.strokeStyle = '#2f0066';
        ctx.lineWidth = 2.5;
        // Right Horn
        ctx.beginPath();
        ctx.moveTo(10, -12);
        ctx.quadraticCurveTo(24, -30, 20, -42);
        ctx.quadraticCurveTo(14, -28, 6, -14);
        ctx.fill();
        ctx.stroke();
        // Left Horn
        ctx.beginPath();
        ctx.moveTo(-10, -12);
        ctx.quadraticCurveTo(-24, -30, -20, -42);
        ctx.quadraticCurveTo(-14, -28, -6, -14);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // 4. Heavy Shield on Left Arm
        ctx.save();
        if (isBlocking) {
            ctx.translate(24, -55 + breathe);
            ctx.rotate(0.2);
        } else {
            ctx.translate(-22, -55 + breathe);
            ctx.rotate(-0.1);
        }
        
        // Gothic spiked shield
        ctx.fillStyle = '#151324';
        ctx.strokeStyle = '#9d00ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(20, -15);
        ctx.lineTo(12, 22);
        ctx.lineTo(0, 35);
        ctx.lineTo(-12, 22);
        ctx.lineTo(-20, -15);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // 5. Giant Greatsword
        ctx.save();
        ctx.translate(-18, -55 + breathe);
        
        let swordAngle = -Math.PI * 0.75; // Guard position
        if (isAttacking) {
            const prog = (this.stateMaxTime - this.stateTimer) / this.stateMaxTime;
            if (prog < 0.45) {
                swordAngle = -Math.PI * 1.2; // cocked back
            } else if (prog < 0.75) {
                swordAngle = -Math.PI * 0.2; // down slash swing
            }
        }
        ctx.rotate(swordAngle);

        // Hilt
        ctx.fillStyle = '#111';
        ctx.fillRect(-2, -4, 25, 8);
        ctx.fillStyle = '#ffd700'; // Golden skull guard
        ctx.fillRect(23, -12, 5, 24);

        // Huge glowing purple blade
        ctx.fillStyle = '#150529';
        ctx.strokeStyle = '#9d00ff';
        ctx.shadowColor = '#9d00ff';
        ctx.shadowBlur = isDead ? 0 : 18;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(28, -6);
        ctx.lineTo(95, -5);
        ctx.lineTo(105, 0);
        ctx.lineTo(95, 5);
        ctx.lineTo(28, 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();

        ctx.restore();
    }

    drawDragon(ctx) {
        const breathe = Math.sin(this.animTime * 1.3) * 6;
        const wingFlap = Math.sin(this.animTime * 2.5) * 0.4;
        const isAttacking = this.state === 'attack';
        const isDead = this.state === 'death';

        ctx.save();
        ctx.translate(0, -30); // Higher origin for large boss

        if (isDead) {
            ctx.translate(0, 80);
            ctx.rotate(-Math.PI * 0.48);
        }

        // 1. Giant Dragon Tail
        ctx.strokeStyle = '#5a0a00';
        ctx.fillStyle = '#8f1200';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-35, 10);
        ctx.quadraticCurveTo(-80, 20 + breathe * 2, -100, -20 + breathe);
        ctx.quadraticCurveTo(-90, -10 + breathe, -35, 20);
        ctx.fill();
        ctx.stroke();

        // 2. Wings (Flapping behind body)
        ctx.save();
        ctx.translate(-25, -60);
        ctx.rotate(-wingFlap);
        
        let wingGrad = ctx.createLinearGradient(0, 0, -80, -80);
        wingGrad.addColorStop(0, '#500');
        wingGrad.addColorStop(1, '#1a0000');
        ctx.fillStyle = wingGrad;
        ctx.strokeStyle = '#900';
        ctx.lineWidth = 3;
        
        // Back wing outline
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-80, -90);
        ctx.lineTo(-50, -40);
        ctx.lineTo(-90, -20);
        ctx.lineTo(-30, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // 3. Legs
        ctx.fillStyle = '#6d0d00';
        ctx.fillRect(-22, 10, 16, 50);
        ctx.fillRect(6, 10, 16, 50);
        // Claws
        ctx.fillStyle = '#dcdcdc';
        ctx.fillRect(-26, 54, 8, 8);
        ctx.fillRect(2, 54, 8, 8);

        // 4. Large Dragon Body
        let scaleGrad = ctx.createLinearGradient(-45, -70, 45, 20);
        scaleGrad.addColorStop(0, '#aa1100');
        scaleGrad.addColorStop(0.6, '#7c0c00');
        scaleGrad.addColorStop(1, '#440400');
        ctx.fillStyle = scaleGrad;
        ctx.strokeStyle = '#ff3c00';
        
        ctx.beginPath();
        ctx.moveTo(-45, 20);
        ctx.lineTo(-40, -65 + breathe * 0.5);
        ctx.lineTo(35, -45 + breathe * 0.5);
        ctx.lineTo(40, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 5. Neck and Head
        ctx.save();
        // Adjust head position forward on attack
        let headLunge = 0;
        if (isAttacking) {
            const prog = (this.stateMaxTime - this.stateTimer) / this.stateMaxTime;
            headLunge = Math.sin(prog * Math.PI) * 50;
        }

        ctx.translate(30 + headLunge, -55 + breathe);
        ctx.rotate(0.1 + (isAttacking ? 0.3 : 0));

        // Long Neck
        ctx.fillStyle = '#7c0c00';
        ctx.strokeStyle = '#ff3c00';
        ctx.fillRect(-10, 0, 28, 40);
        ctx.strokeRect(-10, 0, 28, 40);

        // Dragon Head
        ctx.beginPath();
        ctx.moveTo(-15, -15);
        ctx.lineTo(25, -25); // snout top
        ctx.lineTo(35, -5);  // nose
        ctx.lineTo(15, 8);   // mouth open
        ctx.lineTo(-10, 12); // jaw base
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Horns
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(-10, -15);
        ctx.lineTo(-26, -35);
        ctx.lineTo(-8, -20);
        ctx.closePath();
        ctx.fill();

        // Glowing yellow eye
        if (!isDead) {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffbb00';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(8, -10, 4, 0, Math.PI*2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.restore();

        // 6. Front Wing (In front of body)
        ctx.save();
        ctx.translate(-5, -40);
        ctx.rotate(-wingFlap * 1.1 + 0.3);
        
        ctx.fillStyle = wingGrad;
        ctx.strokeStyle = '#c00';
        ctx.lineWidth = 3.5;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-100, -70);
        ctx.lineTo(-65, -30);
        ctx.lineTo(-110, -5);
        ctx.lineTo(-40, 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.restore();
    }
}

// Export for module/global availability
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameRenderer, GameCharacter };
} else {
    window.GameRenderer = GameRenderer;
    window.GameCharacter = GameCharacter;
}
