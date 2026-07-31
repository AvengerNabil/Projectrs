/* ========================================
   Smart Electronics — Products Page JS
   Search, Filter, Sort, Pagination
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  initProductsPage();
});

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 8;

function initProductsPage() {
  allProducts = StorageAPI.getProducts();
  filteredProducts = [...allProducts];

  // Parse URL parameters for initial category filter
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  
  if (initialCategory) {
    const checkboxes = document.querySelectorAll('input[name="category"]');
    checkboxes.forEach(cb => {
      if (cb.value === initialCategory) {
        cb.checked = true;
      }
    });
  }

  // Bind Events
  document.getElementById('searchInput')?.addEventListener('input', debounce(handleSearch, 300));
  document.getElementById('sortSelect')?.addEventListener('change', handleSort);
  
  // Set initial price range placeholders
  const maxPrice = Math.max(...allProducts.map(p => p.price));
  const minInput = document.getElementById('priceMin');
  const maxInput = document.getElementById('priceMax');
  if (minInput) minInput.placeholder = '0';
  if (maxInput) maxInput.placeholder = Math.ceil(maxPrice);

  renderRecentlyViewed();
  
  // Initial render based on URL or defaults
  applyFilters();
}

/* ========================================
   1. Search & Filter Logic
   ======================================== */
function handleSearch() {
  applyFilters();
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
  
  const categoryChecked = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
  const stockChecked = Array.from(document.querySelectorAll('input[name="stock"]:checked')).map(cb => cb.value);
  
  const minPrice = parseFloat(document.getElementById('priceMin')?.value) || 0;
  const maxPrice = parseFloat(document.getElementById('priceMax')?.value) || Infinity;

  filteredProducts = allProducts.filter(product => {
    // Search
    const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                          product.category.toLowerCase().includes(searchTerm);
    
    // Category
    const matchesCategory = categoryChecked.length === 0 || categoryChecked.includes(product.category);
    
    // Stock
    const matchesStock = stockChecked.length === 0 || stockChecked.includes(product.stock);
    
    // Price
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesStock && matchesPrice;
  });

  handleSort(); // Sort handles rendering and pagination reset
}

function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (cb.name === 'stock') {
       // Default stock checked
       cb.checked = cb.value !== 'out-of-stock';
    } else {
       cb.checked = false;
    }
  });

  document.getElementById('sortSelect').value = 'featured';

  // Clear URL params without reloading
  window.history.replaceState({}, document.title, window.location.pathname);

  applyFilters();
}

function toggleMobileFilters() {
  const sidebar = document.getElementById('filtersSidebar');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
  }
}

/* ========================================
   2. Sorting Logic
   ======================================== */
function handleSort() {
  const sortValue = document.getElementById('sortSelect')?.value || 'featured';

  filteredProducts.sort((a, b) => {
    switch (sortValue) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name-az': return a.name.localeCompare(b.name);
      case 'name-za': return b.name.localeCompare(a.name);
      case 'rating': return b.rating - a.rating;
      case 'featured': 
      default:
        // Featured first, then highest rating
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
    }
  });

  currentPage = 1;
  renderProducts();
}

/* ========================================
   3. Render Grid & Pagination
   ======================================== */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const countEl = document.getElementById('resultsCount');
  
  if (!grid) return;

  const total = filteredProducts.length;
  if (countEl) countEl.textContent = `Showing ${total} product${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color);">
        <div style="font-size: 3rem; margin-bottom: 16px;">🔍</div>
        <h3 style="font-size: 1.25rem; margin-bottom: 8px;">No products found</h3>
        <p style="color: var(--text-secondary);">Try adjusting your filters or search term.</p>
        <button class="btn btn-secondary" style="margin-top: 16px;" onclick="resetFilters()">Clear Filters</button>
      </div>
    `;
    renderPagination(0);
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filteredProducts.slice(start, start + itemsPerPage);

  // Use main.js generateProductCard
  grid.innerHTML = paginated.map(p => generateProductCard(p)).join('');
  
  renderPagination(total);
}

function renderPagination(totalItems) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">←</button>`;
  
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  
  html += `<button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">→</button>`;
  
  container.innerHTML = html;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderProducts();
  
  // Scroll to top of products list smoothly
  document.querySelector('.products-page-header').scrollIntoView({ behavior: 'smooth' });
}

/* ========================================
   4. Recently Viewed
   ======================================== */
function renderRecentlyViewed() {
  const section = document.getElementById('recentlyViewed');
  const grid = document.getElementById('recentlyViewedGrid');
  if (!section || !grid) return;

  const viewedIds = StorageAPI.getRecentlyViewed();
  if (viewedIds.length === 0) {
    section.style.display = 'none';
    return;
  }

  const all = StorageAPI.getProducts();
  const viewedProducts = viewedIds.map(id => all.find(p => p.id === id)).filter(p => p);

  if (viewedProducts.length > 0) {
    section.style.display = 'block';
    // Simplified card for recently viewed
    grid.innerHTML = viewedProducts.map(p => generateProductCard(p)).join('');
  }
}

/* ========================================
   5. Utility: Debounce
   ======================================== */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
