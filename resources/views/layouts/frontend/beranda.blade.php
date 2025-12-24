@extends('layouts.frontend.app')

@section('title', 'Beranda - Halo Apotek')

@section('content')
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-6">
                    <h1 class="hero-title">Selamat Datang di Halo Apotek</h1>
                    <p class="hero-subtitle">Solusi terpercaya untuk kebutuhan kesehatan Anda. Dapatkan obat dan produk kesehatan berkualitas dengan mudah dan cepat.</p>
                </div>
                <div class="col-lg-6 text-center">
                    <i class="fas fa-heartbeat" style="font-size: 200px; opacity: 0.3;"></i>
                </div>
            </div>
        </div>
    </section>

    <!-- Products Section -->
    <section id="produk" class="container mb-5">
        <h2 class="section-title">
            <i class="fas fa-pills me-2"></i>Daftar Obat & Produk
        </h2>
        <div id="products-container">
            <!-- React akan merender produk di sini -->
        </div>
    </section>
@endsection

@section('scripts')
    <script>
        // Data produk dari Laravel
        window.productsData = @json($products);
        window.apiUrl = '{{ url("/api/products") }}';
        window.csrfToken = '{{ csrf_token() }}';
    </script>
@endsection

