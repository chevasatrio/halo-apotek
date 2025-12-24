# 🧪 Test React - Quick Guide

## ✅ Langkah-langkah Test

### 1. Pastikan Dependencies Terinstall
```bash
npm install
```

### 2. Jalankan Vite Dev Server
**Buka terminal baru dan jalankan:**
```bash
npm run dev
```

**Output yang diharapkan:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**JANGAN TUTUP TERMINAL INI!**

### 3. Jalankan Laravel Server
**Buka terminal lain:**
```bash
php artisan serve
```

### 4. Buka Browser
Akses: `http://localhost:8000/` atau `http://localhost:8000/beranda`

---

## 🔍 Cek di Browser

### A. Buka Developer Tools (F12)
1. Pergi ke tab **Console**
2. Lihat apakah ada log:
   - `🚀 React App Initializing...`
   - `✅ React ProductsList Rendered Successfully`
   - `✅ CartManager Initialized`
   - `✅ All Components Initialized Successfully!`

### B. Cek Network Tab
1. Refresh halaman (F5)
2. Cari file `app.jsx` atau `app.js`
3. Pastikan status **200 OK**

### C. Test Visual
- ✅ Produk tampil di halaman
- ✅ Icon keranjang bisa diklik
- ✅ Icon lokasi bisa diklik
- ✅ Badge keranjang muncul (saat ada item)

---

## ❌ Jika Ada Masalah

### Error: "Cannot find module 'laravel-vite-plugin'"
```bash
npm install laravel-vite-plugin --save-dev
```

### Error: "Vite not found"
```bash
npm install vite --save-dev
```

### Error: "React is not defined"
```bash
npm install react react-dom --save
```

### Halaman Blank / React tidak muncul
1. Pastikan `npm run dev` sedang berjalan
2. Cek console browser untuk error
3. Pastikan `@vite(['resources/js/app.jsx'])` ada di `app.blade.php`
4. Cek terminal Vite untuk error

### File tidak ter-load (404)
1. Pastikan Vite dev server berjalan
2. Cek apakah port 5173 tidak digunakan
3. Restart Vite: `Ctrl+C` lalu `npm run dev` lagi

---

## 🎯 Quick Test di Console

Buka console browser (F12) dan ketik:

```javascript
// Cek apakah React sudah load
console.log('React:', typeof React !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded');

// Cek CartManager
console.log('CartManager:', window.cartManager ? '✅ Available' : '❌ Not Available');

// Cek LocationTracker
console.log('LocationTracker:', window.locationTracker ? '✅ Available' : '❌ Not Available');

// Cek Products Data
console.log('Products:', window.productsData);

// Test buka keranjang
if (window.cartManager) {
    window.cartManager.showCart();
}
```

---

## 📝 Checklist

- [ ] `npm install` sudah dijalankan
- [ ] `npm run dev` sedang berjalan (terminal tidak ditutup)
- [ ] Laravel server berjalan
- [ ] Browser mengakses `http://localhost:8000/beranda`
- [ ] Developer Tools (F12) dibuka
- [ ] Console tidak ada error merah
- [ ] Produk tampil di halaman

---

## 🎉 Jika Berhasil

Anda akan melihat:
- ✅ Produk tampil dengan card yang bagus
- ✅ Console menampilkan log sukses
- ✅ Icon keranjang dan lokasi bisa diklik
- ✅ Tidak ada error di console

**React sudah berjalan dengan baik! 🚀**

