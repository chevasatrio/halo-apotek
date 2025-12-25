class CartManager {
    constructor() {
        console.log('🛒 CartManager: Constructor called');
        this.cart = this.loadCart();
        console.log('🛒 CartManager: Cart loaded', this.cart);
        this.updateCartBadge();
    }

    loadCart() {
        const savedCart = localStorage.getItem('haloApotekCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('haloApotekCart', JSON.stringify(this.cart));
        this.updateCartBadge();
    }

    addToCart(product) {
        console.log('🛒 CartManager: Adding product to cart', product);
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                alert('Stok tidak mencukupi!');
                return;
            }
            existingItem.quantity += 1;
            console.log('🛒 CartManager: Updated quantity for existing item');
        } else {
            if (product.stock === 0) {
                alert('Produk ini sedang habis!');
                return;
            }
            this.cart.push({
                ...product,
                quantity: 1
            });
            console.log('🛒 CartManager: Added new item to cart');
        }

        this.saveCart();
        this.showNotification('Produk ditambahkan ke keranjang!');
        console.log('🛒 CartManager: Cart updated', this.cart);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.showCart();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else if (quantity > item.stock) {
                alert('Stok tidak mencukupi!');
            } else {
                item.quantity = quantity;
                this.saveCart();
                this.showCart();
            }
        }
    }

    getTotalPrice() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    updateCartBadge() {
        const badge = document.getElementById('cartBadge');
        if (badge) {
            const total = this.getTotalItems();
            badge.textContent = total;
            badge.style.display = total > 0 ? 'flex' : 'none';
        }
    }

    showCart() {
        const cartHtml = this.generateCartHTML();
        this.showModal('Keranjang Belanja', cartHtml);
    }

    generateCartHTML() {
        if (this.cart.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Keranjang Anda kosong</p>
                </div>
            `;
        }

        const itemsHtml = this.cart.map(item => `
            <div class="d-flex align-items-center mb-3 p-3 border rounded">
                <div class="flex-grow-1">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="mb-0 text-muted">${this.formatPrice(item.price)} x ${item.quantity}</p>
                </div>
                <div class="d-flex align-items-center me-3">
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary" onclick="window.cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="text-end me-3">
                    <strong>${this.formatPrice(item.price * item.quantity)}</strong>
                </div>
                <button class="btn btn-sm btn-danger" onclick="window.cartManager.removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        return `
            ${itemsHtml}
            <div class="border-top pt-3 mt-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>Total:</h5>
                    <h4 class="text-primary">${this.formatPrice(this.getTotalPrice())}</h4>
                </div>
                <button class="btn btn-primary w-100" onclick="window.cartManager.checkout()">
                    <i class="fas fa-credit-card me-2"></i>Checkout
                </button>
            </div>
        `;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    }

    showModal(title, content) {
        // Create modal if it doesn't exist
        let modalElement = document.getElementById('cartModal');

        if (!modalElement) {
            modalElement = document.createElement('div');
            modalElement.id = 'cartModal';
            modalElement.className = 'modal fade';
            modalElement.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"></h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="cartModalBody"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(modalElement);
        }

        // Update content
        modalElement.querySelector('.modal-title').innerText = title;
        document.getElementById('cartModalBody').innerHTML = content;

        // Manage Bootstrap Modal Instance
        let bsModal = bootstrap.Modal.getInstance(modalElement);
        if (!bsModal) {
            bsModal = new bootstrap.Modal(modalElement);
        }

        bsModal.show();
    }

    checkout() {
        if (this.cart.length === 0) {
            alert('Keranjang Anda kosong!');
            return;
        }

        // Redirect to checkout page - Middleware will handle authentication
        window.location.href = '/checkout';
    }

    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
        notification.style.zIndex = '9999';
        notification.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>${message}
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

export default CartManager;

