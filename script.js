class ShoppingCart {
    constructor() {
        this.storageKey = 'cart';
    }

    add(item) {
        let cart = this.getCart();
        const existing = cart.find(i => i.id === item.id);

        if (existing) {
            existing.quantity += item.quantity || 1;
        } else {
            cart.push({ ...item, quantity: item.quantity || 1 });
        }

        localStorage.setItem(this.storageKey, JSON.stringify(cart));
        return cart;
    }

    remove(itemId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem(this.storageKey, JSON.stringify(cart));
        return cart;
    }

    getCart() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    }
}

// Usage:
const cart = new ShoppingCart();
cart.add({ id: 1, name: 'Laptop', price: 999 });
cart.add({ id: 2, name: 'Mouse', price: 25 });
console.log(cart.getCart());
