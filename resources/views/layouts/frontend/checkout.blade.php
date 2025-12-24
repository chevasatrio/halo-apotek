@extends('layouts.frontend.app')

@section('title', 'Checkout - Halo Apotek')

@section('content')
    <div class="container my-5">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('beranda') }}">Beranda</a></li>
                <li class="breadcrumb-item"><a href="{{ route('keranjang') }}">Keranjang</a></li>
                <li class="breadcrumb-item active" aria-current="page">Checkout</li>
            </ol>
        </nav>

        <h2 class="mb-4">
            <i class="fas fa-credit-card me-2"></i>Checkout
        </h2>

        <div class="row">
            <!-- Checkout Form -->
            <div class="col-lg-8 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Informasi Pengiriman</h5>
                    </div>
                    <div class="card-body">
                        <form id="checkoutForm">
                            <div class="mb-3">
                                <label for="nama" class="form-label">Nama Penerima <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="nama" required>
                            </div>

                            <div class="mb-3">
                                <label for="telepon" class="form-label">No. Telepon <span class="text-danger">*</span></label>
                                <input type="tel" class="form-control" id="telepon" required>
                            </div>

                            <div class="mb-3">
                                <label for="alamat" class="form-label">Alamat Lengkap <span class="text-danger">*</span></label>
                                <textarea class="form-control" id="alamat" rows="3" required></textarea>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="kota" class="form-label">Kota <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="kota" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="kode_pos" class="form-label">Kode Pos</label>
                                    <input type="text" class="form-control" id="kode_pos">
                                </div>
                            </div>

                            <hr class="my-4">

                            <h5 class="mb-3">Metode Pembayaran</h5>
                            <div class="mb-3">
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="metode_pembayaran" id="transfer" value="transfer" checked>
                                    <label class="form-check-label" for="transfer">
                                        <i class="fas fa-university me-2"></i>Transfer Bank
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="metode_pembayaran" id="cod" value="cod">
                                    <label class="form-check-label" for="cod">
                                        <i class="fas fa-money-bill-wave me-2"></i>Cash on Delivery (COD)
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="metode_pembayaran" id="ewallet" value="ewallet">
                                    <label class="form-check-label" for="ewallet">
                                        <i class="fas fa-wallet me-2"></i>E-Wallet (OVO, GoPay, Dana)
                                    </label>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="catatan" class="form-label">Catatan (Opsional)</label>
                                <textarea class="form-control" id="catatan" rows="2" placeholder="Catatan untuk penjual..."></textarea>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Order Summary -->
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">Ringkasan Pesanan</h5>
                    </div>
                    <div class="card-body">
                        <div id="order-summary">
                            <div class="text-center py-3">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="row mt-4">
            <div class="col-12">
                <a href="{{ route('keranjang') }}" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-2"></i>Kembali ke Keranjang
                </a>
                <button type="button" class="btn btn-primary btn-lg float-end" id="submitCheckout">
                    <i class="fas fa-check me-2"></i>Konfirmasi Pesanan
                </button>
            </div>
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

        function renderOrderSummary() {
            const summaryContainer = document.getElementById('order-summary');
            
            if (!window.cartManager || window.cartManager.cart.length === 0) {
                summaryContainer.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>Keranjang kosong. Silakan kembali ke keranjang.
                    </div>
                `;
                return;
            }

            const cart = window.cartManager.cart;
            const subtotal = window.cartManager.getTotalPrice();
            const ongkir = 15000; // Default ongkir
            const total = subtotal + ongkir;

            let html = '';
            
            // Cart Items
            cart.forEach(item => {
                html += `
                    <div class="d-flex justify-content-between mb-2">
                        <div>
                            <small>${item.name} x ${item.quantity}</small>
                        </div>
                        <small>${formatPrice(item.price * item.quantity)}</small>
                    </div>
                `;
            });

            html += '<hr>';

            // Subtotal
            html += `
                <div class="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <strong>${formatPrice(subtotal)}</strong>
                </div>
            `;

            // Ongkir
            html += `
                <div class="d-flex justify-content-between mb-2">
                    <span>Ongkos Kirim:</span>
                    <strong>${formatPrice(ongkir)}</strong>
                </div>
            `;

            html += '<hr>';

            // Total
            html += `
                <div class="d-flex justify-content-between mb-3">
                    <h5>Total:</h5>
                    <h4 class="text-primary">${formatPrice(total)}</h4>
                </div>
            `;

            summaryContainer.innerHTML = html;
        }

        document.getElementById('submitCheckout').addEventListener('click', function() {
            if (!window.cartManager || window.cartManager.cart.length === 0) {
                alert('Keranjang Anda kosong!');
                return;
            }

            // Get form data
            const formData = {
                nama: document.getElementById('nama').value,
                telepon: document.getElementById('telepon').value,
                alamat: document.getElementById('alamat').value,
                kota: document.getElementById('kota').value,
                kode_pos: document.getElementById('kode_pos').value,
                metode_pembayaran: document.querySelector('input[name="metode_pembayaran"]:checked').value,
                catatan: document.getElementById('catatan').value,
                items: window.cartManager.cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };

            // Validate
            if (!formData.nama || !formData.telepon || !formData.alamat || !formData.kota) {
                alert('Mohon lengkapi semua field yang wajib diisi!');
                return;
            }

            // Check if user is logged in
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert('Silakan login terlebih dahulu untuk checkout!');
                window.location.href = '/login';
                return;
            }

            // Submit to API
            fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Checkout berhasil') {
                    alert('Pesanan berhasil dibuat!');
                    // Clear cart
                    window.cartManager.cart = [];
                    window.cartManager.saveCart();
                    // Redirect to order confirmation or home
                    window.location.href = '{{ route("beranda") }}';
                } else {
                    alert('Checkout gagal: ' + (data.error || data.message));
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat checkout. Silakan coba lagi.');
            });
        });

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            if (window.cartManager) {
                renderOrderSummary();
            } else {
                setTimeout(() => {
                    if (window.cartManager) {
                        renderOrderSummary();
                    }
                }, 500);
            }
        });
    </script>
@endsection

