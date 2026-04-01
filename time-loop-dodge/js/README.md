# Shadow Runner - Endless Runner Game

A high-performance, feature-rich endless runner game built with **HTML5 Canvas**, **CSS3**, and **Vanilla JavaScript**. Navigate through a neon cityscape while avoiding obstacles, collecting power-ups, and achieving high scores!

## 🎮 Features

### Core Gameplay
- **Smooth Running Animation** with particle trail effects
- **Dynamic Difficulty Progression** - Game speed and obstacle complexity increase as you progress
- **Realistic Physics** - Gravity, friction, and momentum-based movement
- **Responsive Controls** - Keyboard (arrow keys) and mobile touch/swipe support
- **Scoring System** - Distance-based score with combo multipliers and close-call bonuses

### Visual Effects
- **Neon Aesthetic** - Vibrant cyan, green, and magenta color scheme with glowing effects
- **Particle System** - Dynamic particle effects for collisions, power-ups, and movement trails
- **Parallax Scrolling** - Multi-layer background scrolling for depth
- **Smooth Animations** - Running cycles, sliding poses, and object rotation
- **Responsive Design** - Works on desktop and mobile (landscape/portrait)

### Gameplay Mechanics
- **Obstacle Types**:
  - Static blocks (rotating)
  - Moving hazards (side-to-side)
  - Spike traps (multi-spike clusters)
  - Platforms (safe landing spots for combos)

- **Power-ups**:
  - 🟢 **Speed Boost** - Increased game speed (5 seconds)
  - 🔷 **Shield** - Block one hit (10 seconds)
  - 🟠 **Invincibility** - No damage from obstacles (3 seconds)

### Audio
- **Web Audio API** - Procedurally generated sound effects
- **Adaptive Sound** - Different sounds for jumping, sliding, collisions, and power-ups
- **Toggleable Audio** - Turn effects and music on/off in settings

### UI/UX
- **Main Menu** - Attractive start screen with instructions
- **HUD Display** - Real-time score, combo, and health bar
- **Pause System** - Pause/resume gameplay anytime
- **Settings Menu** - Toggle sound, music, and particle effects
- **Game Over Screen** - Final stats and restart options
- **Smooth Transitions** - Animated menu transitions

## 📱 Controls

### Desktop
- **Arrow Keys**: Move left/right
- **Arrow Up**: Jump
- **Arrow Down**: Slide
- **Escape**: Pause/Unpause

### Mobile
- **Swipe Left/Right**: Move
- **Swipe Up**: Jump
- **Swipe Down**: Slide
- **Touch Buttons**: Jump/Slide action buttons

## 🎯 Scoring

- **Base Score**: +10 per unit distance traveled
- **Obstacle Bonus**: +1 point per close call (100-50 pixels away)
- **Power-up Bonus**: +500 points per power-up collected
- **Combo Multiplier**: Score × (1 + combo × 0.01)
- **High Combo**: Maintained by platforming and avoiding obstacles

## 🛠️ Technical Architecture

### File Structure
```
shadow-runner-game/
├── index.html           # Main HTML entry point
├─�� css/
│   └── styles.css       # Complete styling (neon theme, responsive)
├── js/
│   ├── game.js          # Main game engine and loop
│   ├── player.js        # Player character logic
│   ├── obstacle.js      # Obstacle and power-up classes
│   ├── particle.js      # Particle system
│   ├── sound.js         # Web Audio API sound manager
│   └── utils.js         # Utility functions (math, collision, etc.)
└── README.md            # This file
```

### Key Classes

**Game**
- Main game engine managing the game loop
- Handles game state (START, PLAYING, PAUSED, GAME_OVER)
- Manages spawning, updates, collision detection
- Controls difficulty progression and scoring

**Player**
- Character with physics (gravity, friction)
- Animation states (running, sliding, jumping)
- Health system
- Input handling

**Obstacle** (Base class with subclasses)
- `BlockObstacle` - Static rotating hazards
- `MovingHazard` - Side-to-side moving obstacles
- `SpikeObstacle` - Multi-spike trap hazards
- `PlatformObstacle` - Safe landing zones
- `PowerUp` - Collectible items

**ParticleSystem**
- Manages dynamic particle effects
- Burst, trail, and custom particle emissions
- Physics-based particle movement

**SoundManager**
- Web Audio API wrapper
- Procedurally generated sounds
- Toggleable audio effects

## 🚀 Performance Optimizations

- **Object Pooling** - Efficient particle and obstacle management
- **Culling** - Off-screen objects automatically removed
- **Canvas 2D Context** - Direct pixel manipulation for speed
- **RequestAnimationFrame** - Synchronized with browser refresh rate
- **Delta Time** - Frame-independent physics and animations
- **Capped Frame Rate** - Prevents performance spikes

## 🎨 Customization Guide

### Change Theme Colors
Edit `:root` CSS variables in `css/styles.css`:
```css
:root {
    --primary-neon: #00ff00;      /* Neon Green */
    --secondary-neon: #00ffff;    /* Cyan */
    --accent-neon: #ff00ff;       /* Magenta */
    --danger-neon: #ff0080;       /* Hot Pink */
}
```

### Adjust Difficulty
In `js/game.js` constructor:
```javascript
this.obstacleSpawnRate = 0;              // Lower = easier spawning
this.nextObstacleSpawnDistance = 150;    // Distance between obstacles
this.maxGameSpeed = 3;                   // Maximum game speed multiplier
this.speedIncreaseRate = 0.0001;         // Difficulty curve
```

### Modify Player Properties
In `js/player.js` constructor:
```javascript
this.moveSpeed = 5;              // Horizontal movement speed
this.jumpPower = 12;             // Jump height
this.gravity = 0.6;              // Gravity strength
this.maxHealth = 100;            // Player health
```

### Add New Obstacles
Create a new class extending `Obstacle` in `js/obstacle.js`:
```javascript
class CustomObstacle extends Obstacle {
    constructor(x, y, width, height) {
        super(x, y, width, height, 'custom');
        this.color = '#ff0000';
    }
    
    update(deltaTime, gameSpeed) {
        // Your custom behavior
    }
    
    draw(ctx) {
        // Your custom drawing
    }
}
```

Then add to `spawnObstacles()` in `js/game.js`.

## 📊 Stats Tracked

- **Score** - Main progression metric
- **Distance** - Total distance traveled (affects difficulty)
- **Combo** - Consecutive successful platforming actions
- **Best Combo** - Highest combo achieved
- **Health** - Player health (0-100)
- **Active Power-ups** - Real-time power-up status with timers

## 🔊 Sound Effects

| Event | Sound |
|-------|-------|
| Jump | Two ascending beeps |
| Slide | Sawtooth sweep |
| Collision | Low frequency warning |
| Power-up Collection | Rising pitch sequence |
| Close Call | Low frequency pulse |
| Game Over | Descending tones |

## 🌐 Browser Compatibility

- **Chrome/Chromium** ✅ Full support
- **Firefox** ✅ Full support
- **Safari** ✅ Full support (iOS 10+)
- **Edge** ✅ Full support
- **Mobile Browsers** ✅ Touch support enabled

## 🎯 Tips & Strategies

1. **Build Combos** - Land on platforms for bonus multipliers
2. **Use Power-ups Wisely** - Save shields for tough sections
3. **Watch Your Health** - Each hit costs 25 health points
4. **Close Calls = Points** - Barely dodging obstacles gives bonus score
5. **Speed Management** - Speed boost can help escape difficult areas
6. **Platform Mastery** - Master platform jumping for high combos

## 🐛 Known Limitations

- Audio quality is procedurally generated (not high-fidelity)
- Canvas rendering limited to 2D primitives
- No persistent high score storage (local in-game tracking only)
- Physics simplified for performance

## 🚀 Future Enhancement Ideas

- [ ] High score leaderboard with localStorage
- [ ] Unlockable character skins
- [ ] Different game modes (time attack, survival)
- [ ] Boss encounters
- [ ] Customizable difficulty presets
- [ ] Particle trail variations per character
- [ ] Sound preset toggle (8-bit vs modern)
- [ ] Screen shake effects
- [ ] Replay system
- [ ] Web Audio background music
- [ ] Multiplayer leaderboard (online)

## 📄 License

This project is free to use, modify, and distribute. No attribution required but appreciated!

## 🎬 Demo

To run the game:
1. Save all files to a local directory
2. Open `index.html` in a modern web browser
3. Click "Start Game" and enjoy!

No build process, no dependencies, no installation required!

---

**Made with ❤️ using vanilla web technologies**