@extends('layouts.frontend.app')

@section('title', 'Keranjang Belanja - Halo Apotek')

@section('content')
    <div class="container my-5">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('beranda') }}">Beranda</a></li>
                <li class="breadcrumb-item active" aria-current="page">Keranjang Belanja</li>
            </ol>
        </nav>

        <h2 class="mb-4">
            <i class="fas fa-shopping-cart me-2"></i>Keranjang Belanja
        </h2>

        <div id="cart-container">
            <!-- React atau JS akan merender keranjang di sini -->
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>

        <!-- Empty Cart Message (hidden by default) -->
        <div id="empty-cart" class="text-center py-5" style="display: none;">
            <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
            <h4 class="text-muted">Keranjang Anda kosong</h4>
            <p class="text-muted mb-4">Mulai belanja untuk menambahkan produk ke keranjang</p>
            <a href="{{ route('beranda') }}" class="btn btn-primary">
                <i class="fas fa-arrow-left me-2"></i>Kembali Berbelanja
            </a>
        </div>
    </div>
@endsection

@section('scripts')
    <script>
        function formatPrice(price) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(price);
        }

        function renderCart() {
            const cartContainer = document.getElementById('cart-container');
            const emptyCart = document.getElementById('empty-cart');
            
            if (window.cartManager) {
                const cart = window.cartManager.cart;
                
                if (cart.length === 0) {
                    cartContainer.style.display = 'none';
                    emptyCart.style.display = 'block';
                    return;
                }

                cartContainer.style.display = 'block';
                emptyCart.style.display = 'none';

                let html = '<div class="row"><div class="col-lg-8">';
                
                // Cart Items
                cart.forEach(item => {
                    html += `
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="row align-items-center">
                                    <div class="col-md-2">
                                        ${item.image ? 
                                            `<img src="${item.image}" alt="${item.name}" class="img-fluid rounded">` :
                                            `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 100px;">
                                                <i class="fas fa-pills fa-2x text-muted"></i>
                                            </div>`
                                        }
                                    </div>
                                    <div class="col-md-4">
                                        <h5 class="mb-1">${item.name}</h5>
                                        <p class="text-muted mb-0">${formatPrice(item.price)}</p>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="input-group">
                                            <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                            <input type="number" class="form-control text-center" value="${item.quantity}" min="1" max="${item.stock}" readonly>
                                            <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                                        </div>
                                        <small class="text-muted">Stok: ${item.stock}</small>
                                    </div>
                                    <div class="col-md-2 text-end">
                                        <h5 class="text-primary">${formatPrice(item.price * item.quantity)}</h5>
                                    </div>
                                    <div class="col-md-1 text-end">
                                        <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                html += '</div><div class="col-lg-4">';
                
                // Cart Summary
                const total = window.cartManager.getTotalPrice();
                html += `
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Ringkasan Belanja</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-3">
                                <span>Subtotal (${window.cartManager.getTotalItems()} item):</span>
                                <strong>${formatPrice(total)}</strong>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between mb-3">
                                <h5>Total:</h5>
                                <h4 class="text-primary">${formatPrice(total)}</h4>
                            </div>
                            <a href="{{ route('checkout') }}" class="btn btn-primary w-100 btn-lg">
                                <i class="fas fa-credit-card me-2"></i>Checkout
                            </a>
                            <a href="{{ route('beranda') }}" class="btn btn-outline-secondary w-100 mt-2">
                                <i class="fas fa-arrow-left me-2"></i>Lanjut Belanja
                            </a>
                        </div>
                    </div>
                `;

                html += '</div></div>';
                cartContainer.innerHTML = html;
            } else {
                cartContainer.innerHTML = '<div class="alert alert-warning">Keranjang belum siap. Silakan refresh halaman.</div>';
            }
        }

        function updateQuantity(productId, quantity) {
            if (window.cartManager) {
                window.cartManager.updateQuantity(productId, quantity);
                renderCart();
            }
        }

        function removeFromCart(productId) {
            if (confirm('Hapus produk dari keranjang?')) {
                if (window.cartManager) {
                    window.cartManager.removeFromCart(productId);
                    renderCart();
                }
            }
        }

        // Initialize cart on page load
        document.addEventListener('DOMContentLoaded', function() {
            if (window.cartManager) {
                renderCart();
            } else {
                // Wait a bit for cartManager to initialize
                setTimeout(() => {
                    if (window.cartManager) {
                        renderCart();
                    } else {
                        document.getElementById('cart-container').innerHTML = 
                            '<div class="alert alert-danger">Error: CartManager tidak tersedia. Silakan refresh halaman.</div>';
                    }
                }, 500);
            }
        });
    </script>
@endsection

