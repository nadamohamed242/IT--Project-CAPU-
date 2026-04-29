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
                    <td style="text-align: center;">$${item.price.toFixed(2)}</td>
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
            z-index: 3000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-in-out;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Add to cart button click (Works for grid items AND the modal button!)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const btn = e.target;
                const item = {
                    id: parseInt(btn.dataset.id),
                    name: btn.dataset.name,
                    price: parseFloat(btn.dataset.price)
                };
                this.add(item);

                // Optional: Automatically close product modal when added to cart
                document.getElementById('product-modal').style.display = 'none';
            }
        });

        // ==========================================
        // CART MODAL LOGIC
        // ==========================================
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.displayCartItems();
                document.getElementById('cart-modal').style.display = 'block';
            });
        }

        const cartCloseBtn = document.querySelector('.cart-close');
        if (cartCloseBtn) {
            cartCloseBtn.addEventListener('click', () => {
                document.getElementById('cart-modal').style.display = 'none';
            });
        }

        // ==========================================
        // PRODUCT DETAILS MODAL LOGIC
        // ==========================================
        const productModal = document.getElementById('product-modal');
        const productCloseBtn = document.querySelector('.product-close');

        // Grab the elements inside the popup that we need to change
        const modalImg = document.getElementById('modal-product-img');
        const modalTitle = document.getElementById('modal-product-title');
        const modalPrice = document.getElementById('modal-product-price');
        const modalDesc = document.getElementById('modal-product-description');
        const modalAddToCartBtn = document.getElementById('modal-add-to-cart');

        // Listen for clicks on product images or titles
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('product-img') || e.target.classList.contains('product-title')) {
                // Find the main card wrapper that holds the data
                const card = e.target.closest('.product-card');
                if (!card) return;

                // Extract the data from the card
                const id = card.getAttribute('data-id');
                const name = card.getAttribute('data-name');
                const price = card.getAttribute('data-price');
                const image = card.getAttribute('data-image');
                const description = card.getAttribute('data-description');

                // Populate the popup with the data
                modalImg.src = image;
                modalTitle.textContent = name;
                modalPrice.textContent = `$${price}`;
                modalDesc.textContent = description;

                // Update the hidden data tags on the popup's "Add to Cart" button!
                modalAddToCartBtn.setAttribute('data-id', id);
                modalAddToCartBtn.setAttribute('data-name', name);
                modalAddToCartBtn.setAttribute('data-price', price);

                // Show the popup
                productModal.style.display = 'block';
            }
        });

        // Close Product Details Modal
        if (productCloseBtn) {
            productCloseBtn.addEventListener('click', () => {
                productModal.style.display = 'none';
            });
        }

        // ==========================================
        // CLOSE MODALS BY CLICKING OUTSIDE
        // ==========================================
        window.addEventListener('click', (event) => {
            const cartModal = document.getElementById('cart-modal');
            const prodModal = document.getElementById('product-modal');

            if (event.target === cartModal) {
                cartModal.style.display = 'none';
            }
            if (event.target === prodModal) {
                prodModal.style.display = 'none';
            }
        });
    }
}
// Create global cart instance
const cart = new ShoppingCart();
//Mgemyy
// Get the form first
const signinForm = document.getElementById('signin-form');

if (signinForm) {
    signinForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get user name from input
        const userName = document.getElementById('name').value;
        const userEmail = document.getElementById('email').value;

        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            name: userName,
            email: userEmail,
            signin_time: new Date().toLocaleString()
        }));//end mg

        // Hide form, show welcome message
        document.getElementById('signin-form-box').style.display = 'none';
        document.getElementById('welcome-box').style.display = 'block';
        document.getElementById('user-name').textContent = userName;
        
        // Auto redirect to home after 3 seconds
        setTimeout(() => {
            window.location.href = 'index.html'; 
        }, 3000);
    });
} // <--- This closing bracket is what was missing before!
// --- 2. CHECK IF ALREADY SIGNED IN ---
window.addEventListener('load', () => {
    const user = localStorage.getItem('currentUser');
    if (user) {
        const userData = JSON.parse(user);
        // Grab the elements
        const signinBox = document.getElementById('signin-form-box');
        const welcomeBox = document.getElementById('welcome-box');
        const userNameDisplay = document.getElementById('user-name');

        // Only change their style if they actually exist on the current page!
        if (signinBox) signinBox.style.display = 'none';
        if (welcomeBox) welcomeBox.style.display = 'block';
        if (userNameDisplay) userNameDisplay.textContent = userData.name;
    }
});


//sign up
const signupForm = document.getElementById('signup-form');

if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();
        //end Mgemyy
    // Get form data
    const fullName = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmpassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Save user data to localStorage
    const newUser = {
        fullName: fullName,
        email: email,
        phone: phone,
        signup_time: new Date().toLocaleString()
    };

    // Get existing users or create new array
    let users = JSON.parse(localStorage.getItem('allUsers')) || [];
    users.push(newUser);
    localStorage.setItem('allUsers', JSON.stringify(users));

    // Set current user as signed in
    localStorage.setItem('currentUser', JSON.stringify({
        name: fullName,
        email: email
    }));

    // Hide form, show welcome message
    document.getElementById('signup-form-box').style.display = 'none';
    document.getElementById('welcome-box').style.display = 'block';
    document.getElementById('user-name').textContent = fullName;

    // Auto redirect to home after 3 seconds
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
});

document.getElementById('contact-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value,
        timestamp: new Date().toLocaleString()
    };

    // Save to localStorage
    let messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    messages.push(formData);
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    // Show success modal
    document.getElementById('success-modal').style.display = 'block';

    // Reset form
    this.reset();

    // Auto-close modal after 3 seconds
    setTimeout(() => {
        document.getElementById('success-modal').style.display = 'none';
    }, 3000);
});

function closeSuccessModal() {
    document.getElementById('success-modal').style.display = 'none';
}

// Close modal when clicking outside
window.addEventListener('click', function (event) {
    const modal = document.getElementById('success-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});


//my account



// Check if user is logged in
function checkLoginStatus() {
    const user = localStorage.getItem('currentUser');
    const notLoggedInDiv = document.getElementById('not-logged-in');
    const loggedInDiv = document.getElementById('logged-in');

    if (!user) {
        notLoggedInDiv.style.display = 'block';
        loggedInDiv.style.display = 'none';
        return;
    }

    const userData = JSON.parse(user);
    notLoggedInDiv.style.display = 'none';
    loggedInDiv.style.display = 'block';

    // Display profile information
    document.getElementById('account-subtitle').textContent = `Welcome, ${userData.name}!`;
    document.getElementById('profile-name').textContent = userData.name || 'N/A';
    document.getElementById('profile-email').textContent = userData.email || 'N/A';
    document.getElementById('profile-phone').textContent = userData.phone || 'Not provided';

    // Display account info
    const memberSince = userData.signin_time || new Date().toLocaleString();
    document.getElementById('member-since').textContent = memberSince;
    document.getElementById('last-login').textContent = new Date().toLocaleString();

    // Display cart as order history
    displayOrderHistory();
}

function displayOrderHistory() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderList = document.getElementById('order-list');

    if (cart.length === 0) {
        orderList.innerHTML = '<div class="no-orders">No orders yet. Start shopping!</div>';
        return;
    }

    let html = '';
    cart.forEach((item, index) => {
        html += `
                    <div class="order-item">
                        <strong>Order #${index + 1}: ${item.name}</strong>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `;
    });
    orderList.innerHTML = html;
}

function editProfile() {
    alert('Edit profile feature coming soon!');
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Load on page load
window.addEventListener('load', checkLoginStatus);}
