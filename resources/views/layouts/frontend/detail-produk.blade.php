@extends('layouts.frontend.app')

@section('title', $product->name . ' - Halo Apotek')

@section('content')
<div class="container my-5">

    <!-- Breadcrumb -->
    <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
            <li class="breadcrumb-item">
                <a href="{{ route('beranda') }}">Beranda</a>
            </li>
            <li class="breadcrumb-item">
                <a href="{{ route('beranda') }}#produk">Produk</a>
            </li>
            <li class="breadcrumb-item active">
                {{ $product->name }}
            </li>
        </ol>
    </nav>

    @php
        use Illuminate\Support\Str;

        $imageUrl = '/default-product.png';

        if ($product->image) {
            if (Str::startsWith($product->image, 'http')) {
                $imageUrl = $product->image;
            } elseif (Str::contains($product->image, 'products/')) {
                $imageUrl = asset('storage/' . $product->image);
            } else {
                $imageUrl = asset('storage/products/' . $product->image);
            }
        }
    @endphp

    <div class="row">

        <!-- PRODUCT IMAGE -->
        <div class="col-md-6 mb-4">
            <img
                src="{{ $imageUrl }}"
                alt="{{ $product->name }}"
                class="img-fluid rounded shadow"
                style="max-height:500px;width:100%;object-fit:cover"
                onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'"
            >
        </div>

        <!-- PRODUCT INFO -->
        <div class="col-md-6">
            <h1 class="mb-3">{{ $product->name }}</h1>

            <h2 class="text-primary mb-3">
                Rp {{ number_format($product->price, 0, ',', '.') }}
            </h2>

            <div class="mb-3">
                <strong><i class="fas fa-box me-2"></i>Stok:</strong>
                <span class="badge {{ $product->stock > 0 ? 'bg-success' : 'bg-danger' }} ms-2">
                    {{ $product->stock > 0 ? $product->stock . ' tersedia' : 'Habis' }}
                </span>
            </div>

            @if ($product->description)
                <div class="mb-4">
                    <h5>Deskripsi Produk</h5>
                    <p class="text-muted">{{ $product->description }}</p>
                </div>
            @endif

            <!-- ADD TO CART -->
            <div class="row mb-3">
                <div class="col-4">
                    <label class="form-label">Jumlah</label>
                    <input
                        type="number"
                        id="quantity"
                        class="form-control"
                        value="1"
                        min="1"
                        max="{{ $product->stock }}"
                        {{ $product->stock == 0 ? 'disabled' : '' }}
                    >
                </div>
            </div>

            <button
                id="addToCartBtn"
                class="btn btn-primary btn-lg w-100 mb-3"
                {{ $product->stock == 0 ? 'disabled' : '' }}
            >
                <i class="fas fa-cart-plus me-2"></i>
                Tambah ke Keranjang
            </button>

            <a href="{{ route('keranjang') }}" class="btn btn-outline-primary btn-lg w-100">
                <i class="fas fa-shopping-cart me-2"></i>
                Lihat Keranjang
            </a>
        </div>
    </div>

    <!-- RELATED PRODUCTS -->
    @if ($relatedProducts->count())
        <div class="mt-5">
            <h3 class="mb-4">Produk Lainnya</h3>

            <div class="row g-4">
                @foreach ($relatedProducts as $related)
                    @php
                        $relatedImage = '/default-product.png';

                        if ($related->image) {
                            if (Str::contains($related->image, 'products/')) {
                                $relatedImage = asset('storage/' . $related->image);
                            } else {
                                $relatedImage = asset('storage/products/' . $related->image);
                            }
                        }
                    @endphp

                    <div class="col-md-3">
                        <a href="{{ route('produk.detail', $related->id) }}" class="text-decoration-none text-dark">
                            <div class="card h-100 shadow-sm">
                                <img
                                    src="{{ $relatedImage }}"
                                    class="card-img-top"
                                    style="height:200px;object-fit:cover"
                                    onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'"
                                >
                                <div class="card-body">
                                    <h6>{{ $related->name }}</h6>
                                    <p class="text-primary fw-bold mb-1">
                                        Rp {{ number_format($related->price, 0, ',', '.') }}
                                    </p>
                                    <small class="text-muted">Stok: {{ $related->stock }}</small>
                                </div>
                            </div>
                        </a>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

</div>
@endsection
