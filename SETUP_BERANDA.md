# Setup Halaman Beranda Apotek

## Instalasi Dependencies

Jalankan perintah berikut untuk menginstall dependencies React dan Vite:

```bash
npm install
```

## Konfigurasi Google Maps API

1. Buka file `resources/views/layouts/frontend/app.blade.php`
2. Ganti `YOUR_API_KEY` dengan API key Google Maps Anda di baris:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap" async defer></script>
   ```
3. Untuk mendapatkan API key, kunjungi: https://console.cloud.google.com/

## Menjalankan Development Server

Jalankan Vite development server:

```bash
npm run dev
```

Atau untuk production build:

```bash
npm run build
```

## Akses Halaman

Setelah server berjalan, akses halaman beranda di:
- URL: `http://localhost:8000/beranda`
- Route name: `beranda`

## Fitur yang Tersedia

1. **Daftar Produk**: Menampilkan semua produk/obat dari database
2. **Keranjang Belanja**: 
   - Icon keranjang di navbar dengan badge jumlah item
   - Klik untuk melihat detail keranjang
   - Tambah/kurang jumlah produk
   - Hapus produk dari keranjang
3. **Lacak Lokasi**:
   - Icon lokasi di navbar
   - Menampilkan peta Google Maps
   - Menampilkan lokasi apotek dan lokasi user (jika diizinkan)
   - Menghitung jarak dan waktu tempuh

## Struktur File

```
resources/
├── views/
│   └── layouts/
│       └── frontend/
│           ├── app.blade.php      # Layout utama
│           └── beranda.blade.php   # View beranda
└── js/
    ├── app.jsx                     # Entry point React
    └── components/
        ├── ProductsList.jsx        # Component daftar produk
        ├── CartManager.js          # Class untuk manage keranjang
        └── LocationTracker.js      # Class untuk track lokasi
```

## Catatan

- Data produk diambil dari database melalui model `Product`
- Keranjang disimpan di localStorage browser
- Untuk checkout, pastikan user sudah login dan memiliki token auth
- Pastikan Google Maps API key sudah dikonfigurasi untuk fitur lokasi

