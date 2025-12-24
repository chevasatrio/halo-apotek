# 🚀 Cara Menjalankan React di Browser - Panduan Lengkap

## 📋 Langkah-langkah Setup

### 1. Install Dependencies
Pastikan semua package sudah terinstall:
```bash
npm install
```

Ini akan menginstall:
- React & React-DOM
- Vite & Laravel Vite Plugin
- @vitejs/plugin-react

### 2. Jalankan Vite Development Server
**PENTING:** Vite harus berjalan untuk compile React!

Buka terminal baru dan jalankan:
```bash
npm run dev
```

Anda akan melihat output seperti:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**JANGAN TUTUP TERMINAL INI!** Biarkan tetap berjalan.

### 3. Jalankan Laravel Server
Buka terminal lain dan jalankan:
```bash
php artisan serve
```

Atau jika pakai Laragon, pastikan server sudah running.

### 4. Buka Browser
Akses: `http://localhost:8000/` atau `http://localhost:8000/beranda`

---

## 🔍 Cara Cek Apakah React Berjalan

### A. Cek di Browser Console (F12)

1. **Buka Developer Tools** (Tekan F12)
2. **Pergi ke tab Console**
3. **Cek apakah ada log berikut:**

```
🚀 React App Initializing...
📦 Products Data: [...]
✅ Products Container Found
📊 Products Count: X
✅ React ProductsList Rendered Successfully
✅ CartManager Initialized
✅ LocationTracker Initialized
✅ Cart Button Event Listener Added
✅ Location Button Event Listener Added
✅ All Components Initialized Successfully!
```

### B. Cek Network Tab

1. Buka **Network tab** di Developer Tools
2. Refresh halaman (F5)
3. Cari file `app.jsx` atau `app.js`
4. Pastikan status **200 OK** (tidak 404)

### C. Test Manual di Console

Ketik di console browser:
```javascript
// Cek apakah CartManager tersedia
window.cartManager

// Cek apakah LocationTracker tersedia
window.locationTracker

// Cek data produk
window.productsData

// Test buka keranjang
window.cartManager.showCart()

// Test buka lokasi
window.locationTracker.showLocation()
```

### D. Cek Visual

1. **Produk harus tampil** di section "Daftar Obat & Produk"
2. **Icon keranjang** di navbar harus bisa diklik
3. **Icon lokasi** di navbar harus bisa diklik
4. **Badge keranjang** muncul saat ada item di cart

---

## ❌ Troubleshooting

### Problem: React tidak muncul / Blank page

**Solusi:**
1. Pastikan Vite dev server berjalan (`npm run dev`)
2. Cek console browser untuk error
3. Pastikan `@vite(['resources/js/app.jsx'])` ada di `app.blade.php`
4. Cek apakah ada error di terminal Vite

### Problem: Error "Cannot find module" atau "Failed to resolve"

**Solusi:**
```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### Problem: CartManager atau LocationTracker undefined

**Solusi:**
1. Cek console untuk error
2. Pastikan semua file di `resources/js/components/` ada
3. Pastikan import di `app.jsx` benar

### Problem: Produk tidak muncul

**Solusi:**
1. Cek apakah ada data di database (table `products`)
2. Cek console: `window.productsData` harus ada isinya
3. Pastikan `HomeController` mengirim data products

### Problem: Vite tidak connect

**Solusi:**
1. Pastikan port 5173 tidak digunakan aplikasi lain
2. Cek firewall
3. Coba restart Vite: `Ctrl+C` lalu `npm run dev` lagi

---

## 📁 Struktur File yang Penting

```
resources/
├── js/
│   ├── app.jsx                    ← Entry point React
│   └── components/
│       ├── ProductsList.jsx       ← Component daftar produk
│       ├── CartManager.js         ← Class untuk keranjang
│       └── LocationTracker.js     ← Class untuk lokasi
└── views/
    └── layouts/
        └── frontend/
            ├── app.blade.php      ← Layout utama (ada @vite)
            └── beranda.blade.php  ← View beranda
```

---

## 🎯 Checklist Sebelum Test

- [ ] `npm install` sudah dijalankan
- [ ] `npm run dev` sedang berjalan (terminal tidak ditutup)
- [ ] Laravel server berjalan (`php artisan serve`)
- [ ] Browser mengakses `http://localhost:8000/beranda`
- [ ] Developer Tools (F12) dibuka untuk cek console
- [ ] Ada data produk di database

---

## 💡 Tips

1. **Selalu buka Console** saat development untuk melihat log
2. **Jangan tutup terminal Vite** saat development
3. **Refresh browser** setelah perubahan file JS/JSX
4. **Cek Network tab** jika file tidak ter-load
5. **Gunakan `console.log()`** untuk debug

---

## 🎉 Jika Semua Berhasil

Anda akan melihat:
- ✅ Produk tampil dengan card yang bagus
- ✅ Bisa klik "Tambah ke Keranjang"
- ✅ Icon keranjang menunjukkan jumlah item
- ✅ Modal keranjang muncul saat klik icon
- ✅ Modal lokasi muncul saat klik icon lokasi
- ✅ Tidak ada error di console

**Selamat! React Anda sudah berjalan! 🚀**

