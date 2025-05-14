document.addEventListener('DOMContentLoaded', async () => {
    // DOM Elements
    const productGrid = document.getElementById('product-grid');
    const cartTable = document.getElementById('cart-table').querySelector('tbody');
    const subtotalEl = document.getElementById('subtotal');
    const vatEl = document.getElementById('vat');
    const grandTotalEl = document.getElementById('grand-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    const currentDateEl = document.getElementById('current-date');
    const categoryTabs = document.querySelectorAll('.category-tab');
    const paymentBtns = document.querySelectorAll('.payment-btn');
    const cashierNameEl = document.getElementById('cashier-name');

    
    // Set current date
    currentDateEl.textContent = new Date().toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // State
    let cart = [];
    let selectedPaymentMethod = 'cash';
    let selectedCategory = 'all';
    
    // Load products
    const products = await API.getProducts();
    console.log("PRODUCTS:", products);
    renderProducts(products);

    
    const cashier = await API.getCurrentCashier();
    if (cashier) {
  document.querySelector('#current-user span').textContent = `${cashier.NAME} (${cashier.LOCATION})`;
} else {
  document.querySelector('#current-user span').textContent = `Cashier: Amanda`;
}

    
    // Category tab click handler
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedCategory = tab.dataset.category;
            filterProducts();
        });
    });
    
    // Payment method click handler
    paymentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            paymentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedPaymentMethod = btn.dataset.method;
        });
    });
    
    // Filter products by category
    function filterProducts() {
        if (selectedCategory === 'all') {
            renderProducts(products);
        } else {
            const filtered = products.filter(p => p.category == selectedCategory);
            renderProducts(filtered);
        }
    }
    
    // Render product grid
    function renderProducts(productsToRender) {
  if (!Array.isArray(productsToRender) || productsToRender.length === 0) {
    productGrid.innerHTML = `<p style="color:red;">No products available</p>`;
    return;
  }

  productGrid.innerHTML = productsToRender.map(product => `
    <div class="product-card" data-id="${product.id}">
      <div class="no-image">${product.name?.charAt(0) || '?'}</div>
      <h3>${product.name || 'Unknown'}</h3>
      <div class="price">R ${Number(product.price).toFixed(2)}</div>
      ${product.weight ? `<small>${product.weight}</small>` : ''}
      <button class="add-to-cart">Add to Cart</button>
    </div>
  `).join('');

  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', addToCart);
  });
}


    
    // Add to cart function
    function addToCart(e) {
        const productId = parseInt(e.target.closest('.product-card').dataset.id);
        const product = products.find(p => p.id === productId);
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }
        
        renderCart();
    }
    
    // Render cart
    function renderCart() {
        cartTable.innerHTML = cart.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>R ${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" min="1" value="${item.quantity}" 
                           data-id="${item.id}" class="qty-input">
                </td>
                <td>R ${(item.price * item.quantity).toFixed(2)}</td>
                <td><button class="remove-item" data-id="${item.id}">×</button></td>
            </tr>
        `).join('');
        
        updateTotals();
        
        // Add event listeners
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', updateQuantity);
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', removeItem);
        });
    }
    
    // Update totals
    function updateTotals() {
        const subtotal = calculateSubtotal();
        const vat = calculateVAT();
        const total = subtotal + vat;
        
        subtotalEl.textContent = `R ${subtotal.toFixed(2)}`;
        vatEl.textContent = `R ${vat.toFixed(2)}`;
        grandTotalEl.textContent = `R ${total.toFixed(2)}`;
    }
    
    // Calculate subtotal
    function calculateSubtotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // Calculate VAT (15%)
    function calculateVAT() {
        return calculateSubtotal() * 0.15;
    }
    
    // Calculate total
    function calculateTotal() {
        return calculateSubtotal() + calculateVAT();
    }
    
    // Update item quantity
    function updateQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === productId);
        const newQty = parseInt(e.target.value);
        
        if (newQty < 1) {
            e.target.value = 1;
            item.quantity = 1;
        } else {
            item.quantity = newQty;
        }
        
        renderCart();
    }
    
    // Remove item from cart
    function removeItem(e) {
        const productId = parseInt(e.target.dataset.id);
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    }
    
    // Clear cart
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        renderCart();
    });
    
    // Handle checkout
    checkoutBtn.addEventListener('click', async () => {
        if (cart.length === 0) {
            alert("Please add items to the cart first!");
            return;
        }
        
        const subtotal = calculateSubtotal();
        const vat = calculateVAT();
        const total = calculateTotal();
        
        const saleData = {
            items: cart,
            subtotal: subtotal,
            vat: vat,
            total: total,
            timestamp: new Date().toISOString(),
            paymentMethod: selectedPaymentMethod,
            employeeId: "EMP001" // Would come from login in real system
        };
        
        const result = await API.createSale(saleData);
        console.log('Sending saleData:', saleData);
        console.log('CreateSale result:', result);

        if (result.success) {
            showMooiMartReceipt(result.receipt);
            cart = [];
            renderCart();
        }
    });
    
    // Show Mooi Mart styled receipt
    function showMooiMartReceipt(receipt) {
        const receiptText = `
            MOOI MART
            ----------------------------
            123 Main St, Potchefstroom
            VAT: ${receipt.vatNumber}
            ----------------------------
            ${receipt.date}
            Cashier: ${receipt.cashier}
            Payment: ${receipt.paymentMethod.toUpperCase()}
            ----------------------------
            ${receipt.items.map(item => `
            ${item.name} x${item.quantity}
            R ${(item.price * item.quantity).toFixed(2)}
            `).join('')}
            ----------------------------
            Subtotal: R ${receipt.subtotal.toFixed(2)}
            VAT (15%): R ${receipt.vat.toFixed(2)}
            TOTAL: R ${receipt.total.toFixed(2)}
            ----------------------------
            Thank you for shopping at
            Mooi Mart!
        `;
        
        alert(receiptText);
    }
    
    // Keyboard shortcut for checkout (F1)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F1') {
            e.preventDefault();
            checkoutBtn.click();
        }
    });
});