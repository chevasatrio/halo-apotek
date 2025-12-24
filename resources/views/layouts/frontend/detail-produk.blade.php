@extends('layouts.frontend.app')

@section('title', $product->name . ' - Halo Apotek')

@section('content')
    <div class="container my-5">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('beranda') }}">Beranda</a></li>
                <li class="breadcrumb-item"><a href="{{ route('beranda') }}#produk">Produk</a></li>
                <li class="breadcrumb-item active" aria-current="page">{{ $product->name }}</li>
            </ol>
        </nav>

        <div class="row">
            <!-- Product Image -->
            <div class="col-md-6 mb-4">
                <div class="product-detail-image">
                    @if($product->image)
                        <img src="{{ $product->image }}" alt="{{ $product->name }}" class="img-fluid rounded shadow" style="max-height: 500px; width: 100%; object-fit: cover;">
                    @else
                        <div class="bg-light rounded shadow d-flex align-items-center justify-content-center" style="height: 500px;">
                            <i class="fas fa-pills fa-5x text-muted"></i>
                        </div>
                    @endif
                </div>
            </div>

            <!-- Product Info -->
            <div class="col-md-6">
                <h1 class="mb-3">{{ $product->name }}</h1>
                
                <div class="product-price-detail mb-4">
                    <h2 class="text-primary mb-2">Rp {{ number_format($product->price, 0, ',', '.') }}</h2>
                </div>

                <div class="product-info mb-4">
                    <div class="mb-3">
                        <strong><i class="fas fa-box me-2"></i>Stok:</strong>
                        @if($product->stock > 0)
                            <span class="badge bg-success ms-2">{{ $product->stock }} tersedia</span>
                        @else
                            <span class="badge bg-danger ms-2">Habis</span>
                        @endif
                    </div>
                </div>

                @if($product->description)
                <div class="product-description mb-4">
                    <h5>Deskripsi Produk</h5>
                    <p class="text-muted">{{ $product->description }}</p>
                </div>
                @endif

                <!-- Add to Cart Section -->
                <div class="add-to-cart-section">
                    <div class="row mb-3">
                        <div class="col-4">
                            <label for="quantity" class="form-label">Jumlah:</label>
                            <input type="number" class="form-control" id="quantity" value="1" min="1" max="{{ $product->stock }}" {{ $product->stock == 0 ? 'disabled' : '' }}>
                        </div>
                    </div>
                    <button 
                        class="btn btn-primary btn-lg w-100 mb-3" 
                        id="addToCartBtn"
                        {{ $product->stock == 0 ? 'disabled' : '' }}
                    >
                        <i class="fas fa-cart-plus me-2"></i>Tambah ke Keranjang
                    </button>
                    <a href="{{ route('keranjang') }}" class="btn btn-outline-primary btn-lg w-100">
                        <i class="fas fa-shopping-cart me-2"></i>Lihat Keranjang
                    </a>
                </div>
            </div>
        </div>

        <!-- Related Products -->
        @if($relatedProducts->count() > 0)
        <div class="row mt-5">
            <div class="col-12">
                <h3 class="mb-4">Produk Lainnya</h3>
                <div class="row g-4">
                    @foreach($relatedProducts as $related)
                    <div class="col-md-3">
                        <div class="card product-card">
                            <a href="{{ route('produk.detail', $related->id) }}" class="text-decoration-none text-dark">
                                @if($related->image)
                                    <img src="{{ $related->image }}" alt="{{ $related->name }}" class="card-img-top product-image">
                                @else
                                    <div class="product-image d-flex align-items-center justify-content-center bg-light">
                                        <i class="fas fa-pills fa-4x text-muted"></i>
                                    </div>
                                @endif
                                <div class="card-body">
                                    <h6 class="card-title">{{ $related->name }}</h6>
                                    <p class="text-primary fw-bold mb-2">Rp {{ number_format($related->price, 0, ',', '.') }}</p>
                                    <small class="text-muted">Stok: {{ $related->stock }}</small>
                                </div>
                            </a>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
        @endif
    </div>
@endsection

@section('scripts')
    <script>
        const productData = {
            id: {{ $product->id }},
            name: @json($product->name),
            price: {{ $product->price }},
            stock: {{ $product->stock }},
            image: @json($product->image)
        };

        document.getElementById('addToCartBtn').addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantity').value);
            
            if (quantity < 1 || quantity > productData.stock) {
                alert('Jumlah tidak valid!');
                return;
            }

            if (window.cartManager) {
                const productToAdd = {
                    ...productData,
                    quantity: quantity
                };
                
                // Add multiple quantities
                for (let i = 0; i < quantity; i++) {
                    window.cartManager.addToCart(productData);
                }
                
                alert('Produk berhasil ditambahkan ke keranjang!');
            } else {
                alert('Keranjang belum siap. Silakan refresh halaman.');
            }
        });
    </script>
@endsection

