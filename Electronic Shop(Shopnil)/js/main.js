/* ========================================
   Smart Electronics — Main JS
   Shared functionality across all pages
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initTheme();
  initNavbar();
  initCartBadge();
  initScrollToTop();
  initNewsletterForm();
  initScrollAnimations();
});

/* ========================================
   1. Page Loading Animation
   ======================================== */
function initLoader() {
  const loader = document.querySelector('.loader-overlay');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Remove from DOM after transition
      setTimeout(() => loader.remove(), 500);
    }, 400);
  });
}

/* ========================================
   2. Dark/Light Mode Toggle
   ======================================== */
function initTheme() {
  const theme = StorageAPI.getTheme();
  applyTheme(theme);

  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const newTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      StorageAPI.setTheme(newTheme);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('#themeToggle .theme-icon');
  if (icon) {
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

/* ========================================
   3. Navbar
   ======================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  // Scroll effect
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Mobile menu toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }

  // Active nav link
  highlightActiveNav();
}

function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ========================================
   4. Cart Badge
   ======================================== */
function initCartBadge() {
  updateCartBadge();

  // Listen for cart updates
  window.addEventListener('cartUpdated', () => {
    updateCartBadge();
  });
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = StorageAPI.getCartCount();

  badges.forEach(badge => {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

/* ========================================
   5. Scroll to Top
   ======================================== */
function initScrollToTop() {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ========================================
   6. Toast Notification System
   ======================================== */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ========================================
   7. Newsletter Form
   ======================================== */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input.value.trim();

    if (!email || !isValidEmail(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const added = StorageAPI.addNewsletterEmail(email);
    if (added) {
      showToast('Successfully subscribed to our newsletter!', 'success');
      input.value = '';
    } else {
      showToast('This email is already subscribed.', 'info');
    }
  });
}

/* ========================================
   8. Scroll Animations
   ======================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (elements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ========================================
   9. Animated Counter
   ======================================== */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const duration = 2000;
        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(start + (target - start) * eased);
          el.textContent = prefix + current.toLocaleString() + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(counter => observer.observe(counter));
}

/* ========================================
   10. Helper: Generate Star Rating HTML
   ======================================== */
function generateStars(rating) {
  let html = '<div class="stars">';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<span>★</span>';
    } else if (i - 0.5 <= rating) {
      html += '<span>★</span>'; // half star shown as full
    } else {
      html += '<span class="empty">★</span>';
    }
  }
  html += '</div>';
  return html;
}

/* ========================================
   11. Helper: Generate Product Card HTML
   ======================================== */
function generateProductCard(product) {
  const isWishlisted = StorageAPI.isInWishlist(product.id);
  const stockClass = product.stock;
  const stockText = product.stock === 'in-stock' ? 'In Stock' :
                     product.stock === 'low-stock' ? 'Low Stock' : 'Out of Stock';

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-card-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy"
             onerror="this.parentElement.style.background='linear-gradient(135deg, #1e293b 0%, #334155 100%)'; this.style.display='none'; this.parentElement.innerHTML+='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;opacity:0.3\\'>📦</div>';">
        <div class="product-card-badges">
          ${product.discount ? `<span class="discount-badge">-${product.discount}%</span>` : ''}
          <span class="stock-badge ${stockClass}">${stockText}</span>
        </div>
        <div class="product-card-actions">
          <button class="action-btn wishlist-btn ${isWishlisted ? 'wishlisted' : ''}"
                  onclick="handleWishlist(${product.id}, this)" title="Add to Wishlist">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
          <button class="action-btn" onclick="openQuickView(${product.id})" title="Quick View">
            👁️
          </button>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${product.category}</div>
        <h3 class="product-card-name">${product.name}</h3>
        <div class="product-card-rating">
          ${generateStars(product.rating)}
          <span class="rating-count">(${product.reviews})</span>
        </div>
        <div class="product-card-price">
          <span class="price-current">$${product.price.toFixed(2)}</span>
          ${product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
        </div>
        <div class="product-card-footer">
          <button class="btn btn-primary btn-sm" onclick="handleAddToCart(${product.id})"
                  ${product.stock === 'out-of-stock' ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
            ${product.stock === 'out-of-stock' ? 'Out of Stock' : '🛒 Add to Cart'}
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openQuickView(${product.id})">
            Details
          </button>
        </div>
      </div>
    </div>
  `;
}

/* ========================================
   12. Handle Add to Cart
   ======================================== */
function handleAddToCart(productId, quantity = 1) {
  const product = StorageAPI.getProductById(productId);
  if (!product || product.stock === 'out-of-stock') return;

  StorageAPI.addToCart(productId, quantity);
  showToast(`${product.name} added to cart!`, 'success');
}

/* ========================================
   13. Handle Wishlist Toggle
   ======================================== */
function handleWishlist(productId, btn) {
  const added = StorageAPI.toggleWishlist(productId);
  const product = StorageAPI.getProductById(productId);

  if (btn) {
    btn.classList.toggle('wishlisted', added);
    btn.innerHTML = added ? '❤️' : '🤍';
  }

  // Update all wishlist buttons for this product
  document.querySelectorAll(`.wishlist-btn`).forEach(b => {
    const card = b.closest('.product-card');
    if (card && parseInt(card.dataset.id) === productId) {
      b.classList.toggle('wishlisted', added);
      b.innerHTML = added ? '❤️' : '🤍';
    }
  });

  if (added) {
    showToast(`${product.name} added to wishlist!`, 'success');
  } else {
    showToast(`${product.name} removed from wishlist.`, 'info');
  }
}

/* ========================================
   14. Quick View Modal
   ======================================== */
function openQuickView(productId) {
  const product = StorageAPI.getProductById(productId);
  if (!product) return;

  // Track recently viewed
  StorageAPI.addRecentlyViewed(productId);

  const stockClass = product.stock;
  const stockText = product.stock === 'in-stock' ? 'In Stock' :
                     product.stock === 'low-stock' ? 'Low Stock' : 'Out of Stock';

  const modalHTML = `
    <div class="modal-overlay active" id="productModal" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModalForce()">✕</button>
        <div class="modal-grid">
          <div class="modal-image">
            <img src="${product.image}" alt="${product.name}"
                 onerror="this.parentElement.style.background='linear-gradient(135deg, #1e293b 0%, #334155 100%)'; this.style.display='none'; this.parentElement.innerHTML+='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;font-size:5rem;opacity:0.3\\'>📦</div>';">
          </div>
          <div class="modal-details">
            <div class="product-card-category">${product.category}</div>
            <h2>${product.name}</h2>
            <div class="product-card-rating">
              ${generateStars(product.rating)}
              <span class="rating-count">${product.rating} (${product.reviews} reviews)</span>
            </div>
            <div class="product-card-price">
              <span class="price-current">$${product.price.toFixed(2)}</span>
              ${product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
              ${product.discount ? `<span class="discount-badge" style="font-size:0.8rem;">-${product.discount}%</span>` : ''}
            </div>
            <span class="stock-badge ${stockClass}" style="display:inline-block;margin-bottom:16px;">${stockText} ${product.stockCount > 0 ? `(${product.stockCount} left)` : ''}</span>
            <p class="modal-description">${product.description}</p>
            <div class="modal-features">
              <h4>Key Features</h4>
              <ul>
                ${product.features.map(f => `<li><span class="check">✓</span> ${f}</li>`).join('')}
              </ul>
            </div>
            <div class="quantity-selector">
              <label>Quantity:</label>
              <div class="quantity-controls">
                <button onclick="updateModalQty(-1)">−</button>
                <input type="number" id="modalQty" value="1" min="1" max="99" readonly>
                <button onclick="updateModalQty(1)">+</button>
              </div>
            </div>
            <div class="modal-actions">
              <button class="btn btn-primary" onclick="addFromModal(${product.id})"
                      ${product.stock === 'out-of-stock' ? 'disabled style="opacity:0.5"' : ''}>
                🛒 Add to Cart
              </button>
              <button class="btn btn-secondary" onclick="handleWishlist(${product.id})">
                ${StorageAPI.isInWishlist(product.id) ? '❤️ Wishlisted' : '🤍 Wishlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existing = document.getElementById('productModal');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden';

  // Close on Escape
  document.addEventListener('keydown', handleModalEscape);
}

function updateModalQty(delta) {
  const input = document.getElementById('modalQty');
  if (!input) return;
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > 99) val = 99;
  input.value = val;
}

function addFromModal(productId) {
  const qty = parseInt(document.getElementById('modalQty')?.value || 1);
  handleAddToCart(productId, qty);
  closeModalForce();
}

function closeModal(event) {
  if (event.target.classList.contains('modal-overlay')) {
    closeModalForce();
  }
}

function closeModalForce() {
  const modal = document.getElementById('productModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleModalEscape);
  }
}

function handleModalEscape(e) {
  if (e.key === 'Escape') closeModalForce();
}

/* ========================================
   15. Utility: Email Validation
   ======================================== */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ========================================
   16. Featured Slider (Home Page)
   ======================================== */
function initFeaturedSlider() {
  const slider = document.getElementById('featuredSlider');
  if (!slider) return;

  const products = StorageAPI.getProducts().filter(p => p.featured);
  slider.innerHTML = products.map(p => generateProductCard(p)).join('');

  let currentOffset = 0;
  const cardWidth = 304; // 280 + 24 gap
  const visibleCards = Math.floor(slider.parentElement.offsetWidth / cardWidth);
  const maxOffset = Math.max(0, (products.length - visibleCards) * cardWidth);

  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentOffset = Math.max(0, currentOffset - cardWidth);
      slider.style.transform = `translateX(-${currentOffset}px)`;
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentOffset = Math.min(maxOffset, currentOffset + cardWidth);
      slider.style.transform = `translateX(-${currentOffset}px)`;
    });
  }

  // Auto slide every 5 seconds
  setInterval(() => {
    currentOffset += cardWidth;
    if (currentOffset > maxOffset) currentOffset = 0;
    slider.style.transform = `translateX(-${currentOffset}px)`;
  }, 5000);
}

/* ========================================
   17. Home Page: Init Stats Counter
   ======================================== */
function initHomePage() {
  initFeaturedSlider();
  animateCounters();
}
