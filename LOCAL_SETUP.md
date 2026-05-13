# Setup Development Lokal

Panduan menjalankan project frontend BPKAD Donggala di environment lokal dengan konfigurasi `withCredentials: true` (cookie-based auth).

---

## Prasyarat

- Node.js >= 18
- Backend Laravel berjalan di `http://localhost:8000`

---

## Langkah 1 — Install Dependencies

```bash
npm install
```

---

## Langkah 2 — Pilih Metode CORS

Ada dua pilihan. **Pilih salah satu.**

---

### Pilihan A — Vite Proxy *(Direkomendasikan)*

Tidak perlu menyentuh konfigurasi backend. Semua request API di-forward lewat Vite sehingga CORS tidak berlaku.

**1. Edit `vite.config.ts`:**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

**2. Edit `.env` (atau buat `.env.local`):**

```env
VITE_API_URL=/api
```

---

### Pilihan B — Konfigurasi CORS di Laravel Backend

Gunakan ini jika tidak ingin mengubah `vite.config.ts`, atau untuk environment staging/production.

**1. `config/cors.php`:**

```php
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

**2. `config/sanctum.php`:**

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost:5173')),
```

**3. `.env` Laravel:**

```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
```

**4. Pastikan middleware `EnsureFrontendRequestsAreStateful` aktif di `bootstrap/app.php` atau `Kernel.php`.**

**5. `.env` frontend tetap:**

```env
VITE_API_URL=http://localhost:8000/api
```

---

## Langkah 3 — Jalankan Frontend

```bash
npm run dev
```

Buka browser ke `http://localhost:5173`.

---

## Langkah 4 — Verifikasi

Buka **DevTools → Application → Cookies → `localhost`**.

Setelah login berhasil, seharusnya muncul cookie session (biasanya bernama `laravel_session`) — bukan token di localStorage.

---

## Troubleshooting

| Gejala | Kemungkinan Penyebab |
|--------|----------------------|
| `CORS error` di console | Pilih Opsi A (proxy), atau periksa `config/cors.php` backend |
| Login berhasil tapi langsung logout | Cookie tidak dikirim balik — pastikan `withCredentials: true` dan CORS `supports_credentials: true` |
| `401` di semua request setelah login | Session cookie tidak dikirim — cek `SESSION_DOMAIN` dan `SANCTUM_STATEFUL_DOMAINS` di backend |
| Cookie ada tapi permission kosong | Endpoint `/auth/me` gagal — pastikan middleware Sanctum aktif di route group |
