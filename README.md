# Gemini AI Chatbot Playground 🚀

Aplikasi chatbot web dinamis dan responsif berbasis full-stack menggunakan **Node.js + Express** di sisi backend dan **Vanilla JavaScript + Tailwind CSS** di sisi frontend, serta terintegrasi langsung dengan model **Google Gemini 2.5 Flash** menggunakan Google Gen AI SDK terbaru (`@google/genai`).

## Fitur Utama ✨
1. **Percakapan Multi-Turn**: Chatbot memiliki ingatan kontekstual atas obrolan sebelumnya.
2. **Preset Karakter Bot**: Pilihan instan untuk membatasi atau merubah gaya kepribadian model.
3. **Sistem Instruksi Dinamis**: Input bebas untuk menuliskan *system instruction* langsung di sisi UI.
4. **Parameter Kreativitas**: Slider untuk mengubah parameter `temperature` secara instan.
5. **Keamanan Maksimal**: Logika pemanggilan API diletakkan di sisi backend (Express), sehingga `GEMINI_API_KEY` Anda terlindungi aman di server.

## Cara Menggunakan di Komputer Lokal Anda 💻

### 1. Prasyarat
Pastikan Anda sudah menginstal **Node.js (v18 ke atas)** di komputer Anda.

### 2. Instalasi Dependensi
Ekstrak berkas ini, buka terminal pada folder proyek, lalu jalankan perintah:
bash
npm install

### 3. Konfigurasi Variabel Lingkungan
Duplikat file .env.example dan ubah namanya menjadi .env.
Buka file .env tersebut lalu masukkan kunci API Gemini Anda di bagian:

### 4. Menjalankan Aplikasi
Mulai server backend lokal dengan menjalankan perintah:
npm start

### 5. Akses di Browser
Buka browser favorit Anda dan kunjungi tautan: 👉 http://localhost:3000
