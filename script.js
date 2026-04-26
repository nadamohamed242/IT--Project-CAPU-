class ShoppingCart {
    constructor() {
        this.storageKey = 'cart';
        this.initializeEventListeners();
    }

    // Add item to cart
    add(item) {
        let cart = this.getCart();
        const existing = cart.find(i => i.id === item.id);

        if (existing) {
            existing.quantity += item.quantity || 1;
        } else {
            cart.push({ ...item, quantity: item.quantity || 1 });
        }

        localStorage.setItem(this.storageKey, JSON.stringify(cart));
        this.showNotification(`${item.name} added to cart!`);
        return cart;
    }

    // Remove item from cart
    remove(itemId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
        this.displayCartItems();
        return cart;
    }

    // Increase quantity
    updateQuantity(itemId, quantity) {
        let cart = this.getCart();
        const item = cart.find(i => i.id === itemId);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.remove(itemId);
            } else {
                localStorage.setItem(this.storageKey, JSON.stringify(cart));
                this.displayCartItems();
            }
        }
        return cart;
    }

    // Get cart from localStorage
    getCart() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }

    // Calculate total price
    getTotal() {
        return this.getCart().reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Display cart items in modal
    displayCartItems() {
        const cart = this.getCart();
        const cartItemsDiv = document.getElementById('cart-items');
        const totalSpan = document.getElementById('cart-total');

        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align: center; padding: 20px;">Your cart is empty</p>';
            totalSpan.textContent = '0.00';
            return;
        }

        let html = '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="border-bottom: 2px solid #ddd;"><th style="text-align: left; padding: 10px;">Product</th><th>Price</th><th>Quantity</th><th>Total</th><th>Action</th></tr>';

        cart.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            html += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px;">${item.name}</td>
                    <td style="text-align: center;">$${item.price}</td>
                    <td style="text-align: center;">
                        <input type="number" value="${item.quantity}" min="1" 
                               onchange="cart.updateQuantity(${item.id}, this.value)" 
                               style="width: 50px;">
                    </td>
                    <td style="text-align: center;">$${itemTotal}</td>
                    <td style="text-align: center;">
                        <button onclick="cart.remove(${item.id})" 
                                style="background-color: #ff6b6b; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">
                            Remove
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        cartItemsDiv.innerHTML = html;
        totalSpan.textContent = this.getTotal().toFixed(2);
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease-in-out;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Add to cart button click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const btn = e.target;
                const item = {
                    id: parseInt(btn.dataset.id),
                    name: btn.dataset.name,
                    price: parseFloat(btn.dataset.price)
                };
                this.add(item);
            }
        });

        // Cart icon click
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.displayCartItems();
                document.getElementById('cart-modal').style.display = 'block';
            });
        }

        // Close modal
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('cart-modal').style.display = 'none';
            });
        }

        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            const modal = document.getElementById('cart-modal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// Create global cart instance
const cart = new ShoppingCart();

