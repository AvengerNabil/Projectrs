/* ========================================
   Smart Electronics — Storage API
   Local Storage wrapper + Product Data
   ======================================== */

const StorageAPI = {
  // --- Keys ---
  KEYS: {
    PRODUCTS: 'se_products',
    CART: 'se_cart',
    WISHLIST: 'se_wishlist',
    RECENTLY_VIEWED: 'se_recently_viewed',
    THEME: 'se_theme',
    CONTACTS: 'se_contacts',
    NEWSLETTER: 'se_newsletter'
  },

  // --- Generic Helpers ---
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('StorageAPI.get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('StorageAPI.set error:', e);
      return false;
    }
  },

  // ========================================
  // Products
  // ========================================
  getProducts() {
    return this.get(this.KEYS.PRODUCTS) || this.getDefaultProducts();
  },

  setProducts(products) {
    return this.set(this.KEYS.PRODUCTS, products);
  },

  initProducts() {
    if (!this.get(this.KEYS.PRODUCTS)) {
      this.set(this.KEYS.PRODUCTS, this.getDefaultProducts());
    }
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  // ========================================
  // Cart
  // ========================================
  getCart() {
    return this.get(this.KEYS.CART) || [];
  },

  setCart(cart) {
    this.set(this.KEYS.CART, cart);
    this.dispatchCartUpdate();
  },

  addToCart(productId, quantity = 1) {
    const cart = this.getCart();
    const existing = cart.find(item => item.productId === productId);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    this.setCart(cart);
    return cart;
  },

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.productId !== productId);
    this.setCart(cart);
    return cart;
  },

  updateCartQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(i => i.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
    this.setCart(cart);
    return cart;
  },

  clearCart() {
    this.setCart([]);
  },

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  getCartTotal() {
    const cart = this.getCart();
    const products = this.getProducts();
    let subtotal = 0;

    cart.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        subtotal += product.price * item.quantity;
      }
    });

    const tax = subtotal * 0.05; // 5% tax
    const shipping = subtotal >= 500 ? 0 : 25; // Free shipping over $500
    const grandTotal = subtotal + tax + shipping;

    return { subtotal, tax, shipping, grandTotal };
  },

  dispatchCartUpdate() {
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: { count: this.getCartCount() }
    }));
  },

  // ========================================
  // Wishlist
  // ========================================
  getWishlist() {
    return this.get(this.KEYS.WISHLIST) || [];
  },

  setWishlist(wishlist) {
    return this.set(this.KEYS.WISHLIST, wishlist);
  },

  toggleWishlist(productId) {
    let wishlist = this.getWishlist();
    const index = wishlist.indexOf(productId);

    if (index > -1) {
      wishlist.splice(index, 1);
      this.setWishlist(wishlist);
      return false; // Removed
    } else {
      wishlist.push(productId);
      this.setWishlist(wishlist);
      return true; // Added
    }
  },

  isInWishlist(productId) {
    return this.getWishlist().includes(productId);
  },

  // ========================================
  // Recently Viewed
  // ========================================
  getRecentlyViewed() {
    return this.get(this.KEYS.RECENTLY_VIEWED) || [];
  },

  addRecentlyViewed(productId) {
    let viewed = this.getRecentlyViewed();
    // Remove if already exists, then add to front
    viewed = viewed.filter(id => id !== productId);
    viewed.unshift(productId);
    // Keep only last 8
    viewed = viewed.slice(0, 8);
    this.set(this.KEYS.RECENTLY_VIEWED, viewed);
  },

  // ========================================
  // Theme
  // ========================================
  getTheme() {
    return this.get(this.KEYS.THEME) || 'light';
  },

  setTheme(theme) {
    return this.set(this.KEYS.THEME, theme);
  },

  // ========================================
  // Contact Submissions
  // ========================================
  getContacts() {
    return this.get(this.KEYS.CONTACTS) || [];
  },

  addContact(contactData) {
    const contacts = this.getContacts();
    contacts.push({
      ...contactData,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    return this.set(this.KEYS.CONTACTS, contacts);
  },

  // ========================================
  // Newsletter
  // ========================================
  getNewsletterEmails() {
    return this.get(this.KEYS.NEWSLETTER) || [];
  },

  addNewsletterEmail(email) {
    const emails = this.getNewsletterEmails();
    if (!emails.includes(email)) {
      emails.push(email);
      this.set(this.KEYS.NEWSLETTER, emails);
      return true;
    }
    return false; // Already subscribed
  },

  // ========================================
  // Default Product Data
  // ========================================
  getDefaultProducts() {
    return [
      {
        id: 1,
        name: 'UltraView 55" 4K Smart TV',
        category: 'TV & Display',
        price: 799.99,
        originalPrice: 999.99,
        rating: 4.5,
        reviews: 128,
        stock: 'in-stock',
        stockCount: 24,
        image: 'images/smart-tv-1.jpg',
        discount: 20,
        featured: true,
        description: 'Experience stunning 4K Ultra HD resolution with vibrant colors and deep contrast. This 55-inch smart TV features built-in streaming apps, voice control, and HDR10+ support for an immersive viewing experience.',
        features: [
          '4K Ultra HD Resolution (3840 x 2160)',
          'HDR10+ & Dolby Vision Support',
          'Built-in Smart TV Platform with Apps',
          'Voice Control Compatible',
          '120Hz Refresh Rate for Smooth Motion',
          '3x HDMI, 2x USB, Wi-Fi 6'
        ]
      },
      {
        id: 2,
        name: 'CinemaView 65" 8K OLED TV',
        category: 'TV & Display',
        price: 1499.99,
        originalPrice: 1799.99,
        rating: 4.8,
        reviews: 89,
        stock: 'in-stock',
        stockCount: 12,
        image: 'images/smart-tv-2.jpg',
        discount: 17,
        featured: true,
        description: 'The ultimate viewing experience with 8K OLED technology. Infinite contrast ratio, perfect blacks, and AI-powered upscaling make every frame a masterpiece on this premium 65-inch display.',
        features: [
          '8K OLED Display with Infinite Contrast',
          'AI-Powered Picture & Sound Optimization',
          'Dolby Vision IQ & Dolby Atmos',
          '120Hz Native Refresh Rate + VRR',
          'Built-in Google TV Platform',
          '4x HDMI 2.1, 3x USB, Bluetooth 5.2'
        ]
      },
      {
        id: 3,
        name: 'ProCool French Door Refrigerator',
        category: 'Kitchen Appliances',
        price: 1299.99,
        originalPrice: 1499.99,
        rating: 4.6,
        reviews: 256,
        stock: 'in-stock',
        stockCount: 18,
        image: 'images/refrigerator-1.jpg',
        discount: 13,
        featured: true,
        description: 'A spacious French door refrigerator with advanced cooling technology. Features a flexible storage system, built-in water dispenser, and energy-efficient inverter compressor for optimal freshness.',
        features: [
          '26 Cu. Ft. Total Capacity',
          'French Door Design with Bottom Freezer',
          'Inverter Linear Compressor',
          'Door-in-Door Easy Access',
          'Built-in Water & Ice Dispenser',
          'Smart Diagnosis Technology'
        ]
      },
      {
        id: 4,
        name: 'FrostMaster Side-by-Side Refrigerator',
        category: 'Kitchen Appliances',
        price: 1699.99,
        originalPrice: 1999.99,
        rating: 4.7,
        reviews: 134,
        stock: 'low-stock',
        stockCount: 5,
        image: 'images/refrigerator-2.jpg',
        discount: 15,
        featured: false,
        description: 'Premium side-by-side refrigerator with a full-width pantry drawer and advanced humidity control. The counter-depth design fits seamlessly into your kitchen while providing ample storage space.',
        features: [
          '28 Cu. Ft. Counter-Depth Design',
          'Side-by-Side Configuration',
          'FlexZone™ Temperature Drawer',
          'Advanced Multi-Airflow System',
          'External Ice & Water Dispenser with Filter',
          'Energy Star Certified'
        ]
      },
      {
        id: 5,
        name: 'ArcticBreeze 1.5 Ton Inverter AC',
        category: 'Cooling',
        price: 649.99,
        originalPrice: 799.99,
        rating: 4.4,
        reviews: 312,
        stock: 'in-stock',
        stockCount: 30,
        image: 'images/ac-1.jpg',
        discount: 19,
        featured: true,
        description: 'Energy-efficient 1.5-ton inverter split air conditioner with rapid cooling technology. Features a 5-star energy rating, anti-bacterial filter, and whisper-quiet operation for comfortable living.',
        features: [
          '1.5 Ton Cooling Capacity',
          '5-Star Energy Rating (Inverter)',
          'Rapid Cooling Technology',
          'Anti-Bacterial & Dust Filter',
          'Silent Operation (24dB Indoor)',
          'Wi-Fi Control via Smartphone App'
        ]
      },
      {
        id: 6,
        name: 'PolarWind 2 Ton Split AC',
        category: 'Cooling',
        price: 849.99,
        originalPrice: 1049.99,
        rating: 4.5,
        reviews: 198,
        stock: 'in-stock',
        stockCount: 15,
        image: 'images/ac-2.jpg',
        discount: 19,
        featured: false,
        description: 'Powerful 2-ton split air conditioner designed for larger rooms. With dual inverter compressor technology, it provides faster cooling while consuming less energy for year-round comfort.',
        features: [
          '2 Ton Dual Inverter Compressor',
          '4-Way Swing for Even Cooling',
          'Turbo Cool Mode',
          'Self-Clean & Auto-Restart Function',
          '100% Copper Condenser',
          'R-32 Eco-Friendly Refrigerant'
        ]
      },
      {
        id: 7,
        name: 'SmartFlow BLDC Ceiling Fan',
        category: 'Cooling',
        price: 189.99,
        originalPrice: 249.99,
        rating: 4.2,
        reviews: 445,
        stock: 'in-stock',
        stockCount: 50,
        image: 'images/fan-1.jpg',
        discount: 24,
        featured: false,
        description: 'Modern BLDC motor ceiling fan with remote control and smart connectivity. Offers exceptional air delivery with minimal energy consumption, featuring a sleek aerodynamic blade design.',
        features: [
          'Energy-Efficient BLDC Motor',
          'Smart Remote with Timer Function',
          '5-Speed Control Settings',
          'Aerodynamic Blade Design',
          'Consumes Only 28W at Full Speed',
          'Silent Operation with LED Indicator'
        ]
      },
      {
        id: 8,
        name: 'AeroTower Bladeless Fan',
        category: 'Cooling',
        price: 399.99,
        originalPrice: 499.99,
        rating: 4.7,
        reviews: 167,
        stock: 'low-stock',
        stockCount: 7,
        image: 'images/fan-2.jpg',
        discount: 20,
        featured: true,
        description: 'Revolutionary bladeless tower fan with Air Multiplier technology. Safe for homes with children and pets, it delivers a powerful, smooth airflow while purifying the air with a built-in HEPA filter.',
        features: [
          'Bladeless Air Multiplier Technology',
          'Built-in HEPA Air Purification Filter',
          '10 Precise Airflow Settings',
          '350° Oscillation Coverage',
          'Sleep Timer (1-9 Hours)',
          'App Control & Voice Assistant Compatible'
        ]
      },
      {
        id: 9,
        name: 'ChefMate Digital Rice Cooker',
        category: 'Kitchen Appliances',
        price: 129.99,
        originalPrice: 159.99,
        rating: 4.3,
        reviews: 523,
        stock: 'in-stock',
        stockCount: 40,
        image: 'images/rice-cooker-1.jpg',
        discount: 19,
        featured: false,
        description: 'Advanced digital rice cooker with fuzzy logic technology for perfectly cooked rice every time. Features multiple cooking presets, a keep-warm function, and a non-stick inner pot.',
        features: [
          '10-Cup Capacity (Uncooked)',
          'Fuzzy Logic Cooking Technology',
          '8 Preset Cooking Modes',
          'Non-Stick Inner Pot with Handles',
          'Programmable Timer (Up to 24 Hours)',
          'Steam Basket & Measuring Cup Included'
        ]
      },
      {
        id: 10,
        name: 'ChefMate Pro Multi-Cooker',
        category: 'Kitchen Appliances',
        price: 179.99,
        originalPrice: 219.99,
        rating: 4.6,
        reviews: 287,
        stock: 'in-stock',
        stockCount: 22,
        image: 'images/rice-cooker-2.jpg',
        discount: 18,
        featured: false,
        description: 'Versatile multi-function cooker that goes beyond rice — slow cook, steam, sauté, bake, and more. Induction heating ensures even cooking, while the intuitive LCD display makes operation effortless.',
        features: [
          '12-in-1 Multi-Cooking Functions',
          'Induction Heating (IH) Technology',
          'Large LCD Display with Touch Controls',
          'Stainless Steel Inner Pot',
          'Auto Keep-Warm & Reheat',
          'Detachable Lid for Easy Cleaning'
        ]
      },
      {
        id: 11,
        name: 'CompactView 43" Full HD Smart TV',
        category: 'TV & Display',
        price: 449.99,
        originalPrice: 549.99,
        rating: 4.1,
        reviews: 367,
        stock: 'in-stock',
        stockCount: 35,
        image: 'images/smart-tv-3.jpg',
        discount: 18,
        featured: false,
        description: 'Perfect for bedrooms and smaller spaces, this 43-inch Full HD smart TV delivers crisp visuals and rich sound. Stream your favorite content with built-in apps and enjoy seamless connectivity.',
        features: [
          'Full HD Resolution (1920 x 1080)',
          'Built-in Streaming Apps (Netflix, YouTube)',
          'Micro Dimming Technology',
          'Game Mode with Low Input Lag',
          '2x HDMI, 1x USB, Wi-Fi 5',
          'Wall Mount Compatible (VESA)'
        ]
      },
      {
        id: 12,
        name: 'ArcticBreeze Portable AC',
        category: 'Cooling',
        price: 349.99,
        originalPrice: 449.99,
        rating: 4.0,
        reviews: 156,
        stock: 'out-of-stock',
        stockCount: 0,
        image: 'images/ac-3.jpg',
        discount: 22,
        featured: false,
        description: 'Versatile portable air conditioner with 3-in-1 functionality: cooling, dehumidifying, and fan mode. Easy to move between rooms with smooth-rolling casters and a window kit included.',
        features: [
          '10,000 BTU Cooling Power',
          '3-in-1: Cool, Dehumidify, Fan',
          'Digital Display with Remote Control',
          'Auto-Evaporation Technology',
          'Caster Wheels for Easy Mobility',
          'Window Installation Kit Included'
        ]
      }
    ];
  }
};

// Initialize products on load
StorageAPI.initProducts();
