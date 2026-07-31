/* ========================================
   Smart Electronics — Cart Page JS
   Cart Rendering, Updates, Totals
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();

  // Listen for cart updates from other tabs/actions
  window.addEventListener('cartUpdated', () => {
    renderCartPage();
  });
});

/* ========================================
   1. Render Cart & Totals
   ======================================== */
function renderCartPage() {
  const cartLayout = document.getElementById('cartLayout');
  const emptyCartView = document.getElementById('emptyCartView');
  const container = document.getElementById('cartItemsContainer');
  
  if (!cartLayout || !emptyCartView || !container) return;

  const cart = StorageAPI.getCart();
  const products = StorageAPI.getProducts();

  if (cart.length === 0) {
    cartLayout.style.display = 'none';
    emptyCartView.style.display = 'block';
    return;
  }

  cartLayout.style.display = 'grid';
  emptyCartView.style.display = 'none';

  let html = '';

  cart.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return; // In case product was removed from catalog

    const itemTotal = (product.price * item.quantity).toFixed(2);

    html += `
      <div class="cart-item" data-id="${product.id}">
        <div class="cart-item-image">
          <img src="${product.image}" alt="${product.name}"
               onerror="this.parentElement.style.background='var(--bg-tertiary)'; this.style.display='none';">
        </div>
        <div class="cart-item-info">
          <div class="category">${product.category}</div>
          <h3>${product.name}</h3>
          <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 4px;">Unit Price: $${product.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-price">
          $${itemTotal}
        </div>
        <div class="cart-item-quantity">
          <div class="quantity-controls">
            <button onclick="updateCartItemQty(${product.id}, -1)">−</button>
            <input type="number" value="${item.quantity}" min="1" max="99" readonly>
            <button onclick="updateCartItemQty(${product.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem(${product.id})" title="Remove item">
          🗑️
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  
  updateCartTotals();
}

function updateCartTotals() {
  const totals = StorageAPI.getCartTotal();

  document.getElementById('summarySubtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
  document.getElementById('summaryTax').textContent = `$${totals.tax.toFixed(2)}`;
  
  const shippingEl = document.getElementById('summaryShipping');
  if (totals.shipping === 0) {
    shippingEl.innerHTML = '<span class="free">Free</span>';
  } else {
    shippingEl.textContent = `$${totals.shipping.toFixed(2)}`;
  }

  document.getElementById('summaryTotal').textContent = `$${totals.grandTotal.toFixed(2)}`;
}

/* ========================================
   2. Cart Actions
   ======================================== */
function updateCartItemQty(productId, delta) {
  const cart = StorageAPI.getCart();
  const item = cart.find(i => i.productId === productId);
  
  if (item) {
    const newQty = item.quantity + delta;
    if (newQty > 0) {
      StorageAPI.updateCartQuantity(productId, newQty);
      // Event triggers re-render via StorageAPI
    } else {
      // If dropping below 1, ask or just remove?
      // Better UX to just drop to 1 or remove. Let's not remove on minus.
      // If they want to remove, they click the trash can.
    }
  }
}

function removeCartItem(productId) {
  const product = StorageAPI.getProductById(productId);
  StorageAPI.removeFromCart(productId);
  if (product) {
    showToast(`${product.name} removed from cart`, 'info');
  }
}

function clearCart() {
  if (confirm('Are you sure you want to clear your entire cart?')) {
    StorageAPI.clearCart();
    showToast('Cart has been cleared', 'info');
  }
}

function checkout() {
  const cart = StorageAPI.getCart();
  if (cart.length === 0) return;
  
  showToast('Proceeding to secure checkout...', 'success');
  
  // Simulate redirect delay
  const btn = document.querySelector('.cart-summary .btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<div class="loader-spinner" style="width:20px;height:20px;border-width:2px;margin:auto;"></div>';
  btn.disabled = true;
  
  setTimeout(() => {
    // In a real app, window.location.href = '/checkout'
    alert('This is a demo. Checkout functionality is not implemented.');
    btn.innerHTML = originalText;
    btn.disabled = false;
  }, 1500);
}
