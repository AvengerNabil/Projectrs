// Vocabulary list categorized by levels
const WORDS_TIER_1 = [
    "cat", "run", "book", "tree", "fish", "game", "home", "fire", "cold", "hero", 
    "sword", "iron", "gold", "fist", "blow", "spell", "wind", "wave", "lava", "rock", 
    "dark", "glow", "spark", "dash", "jump", "roll", "heal", "ring", "helm", "wall", 
    "door", "key", "blue", "red", "fast", "slow", "hard", "easy", "jump", "kick"
];

const WORDS_TIER_2 = [
    "banana", "orange", "planet", "rocket", "dragon", "window", "typing", "battle", 
    "knight", "goblin", "shield", "shadow", "forest", "frozen", "poison", "potion", 
    "scroll", "archer", "wizard", "hammer", "castle", "danger", "combat", "arcade", 
    "active", "legend", "weapon", "armor", "portal", "matrix", "cosmic", "meteor",
    "slasher", "combat", "arcade", "mystic", "rogue", "temple", "danger", "energy"
];

const WORDS_TIER_3 = [
    "computer", "adventure", "keyboard", "strategy", "elephant", "protector", "warrior", 
    "lightning", "firestorm", "blizzard", "champion", "execution", "challenge", "barbarian", 
    "gladiator", "commander", "barricade", "inventory", "spellbook", "mechanical", 
    "definition", "transition", "precision", "overdrive", "colossus", "dungeon",
    "sanctuary", "cataclysm", "juggernaut", "annihilator", "tempest", "dominator"
];

const WORDS_TIER_4 = [
    "communication", "programming", "responsibility", "development", "imagination", 
    "determination", "classification", "administration", "interpretation", "investigation", 
    "representation", "characterization", "visualization", "vulnerability", "implementation", 
    "infrastructure", "synchronization", "virtualization", "specification", "customization",
    "counterattack", "congratulations", "revolutionary", "accomplishment", "authorization"
];

class WordManager {
    constructor() {
        this.history = [];
        this.historyMaxSize = 15;
    }

    /**
     * Get a random word suited for a given level (1 to 20)
     * @param {number} level 
     */
    getWordForLevel(level) {
        let pool = [];
        if (level >= 1 && level <= 5) {
            pool = WORDS_TIER_1;
        } else if (level >= 6 && level <= 10) {
            pool = WORDS_TIER_2;
        } else if (level >= 11 && level <= 15) {
            pool = WORDS_TIER_3;
        } else if (level >= 16 && level <= 20) {
            pool = WORDS_TIER_4;
        } else {
            // Fallback just in case
            pool = WORDS_TIER_1;
        }

        // Filter out words that are in the history
        let available = pool.filter(word => !this.history.includes(word));
        
        // If everything is in history, clear history and pick from entire pool
        if (available.length === 0) {
            this.history = [];
            available = pool;
        }

        const selectedWord = available[Math.floor(Math.random() * available.length)];
        
        // Add to history
        this.history.push(selectedWord);
        if (this.history.length > this.historyMaxSize) {
            this.history.shift();
        }

        return selectedWord;
    }
}

// Export for ES6 modules if loaded, or bind to window
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WordManager };
} else {
    window.WordManager = WordManager;
}
