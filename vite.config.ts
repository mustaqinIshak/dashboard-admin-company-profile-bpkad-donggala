import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  //untuk mengatasi masalah CORS saat pengembangan, 
  // Anda dapat menambahkan konfigurasi proxy di bawah ini. 
  // Pastikan untuk menyesuaikan target dengan URL backend Anda.  
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:8000',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
})
