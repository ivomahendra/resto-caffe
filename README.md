# 🛒 Toko Online Dinamis (Google Sheets Powered)

Aplikasi pemesanan menu sederhana dan responsif (Mobile-Friendly) yang menggunakan **Google Sheets** sebagai database dan **WhatsApp** sebagai sistem pemesanan. Cocok untuk kafe, toko kecil, atau sistem pemesanan meja/takeaway.

---

## ✨ Fitur Utama

* **Menu Dinamis:** Data menu ditarik secara *real-time* dari Google Sheets menggunakan Google Apps Script.
* **Responsif Penuh:** Tampilan grid menu otomatis menyesuaikan:
    * **Desktop:** 5 hingga 8 kolom (padat).
    * **Mobile:** 1 hingga 2 kolom (mudah diakses).
* **Keranjang Belanja:** Mendukung pemesanan banyak item sekaligus dengan fitur tambah/kurang kuantitas (`qty`).
* **Checkout WhatsApp:** Pesanan dikirim dalam format terstruktur ke nomor WhatsApp Admin, mencakup rincian item, kuantitas, nama pemesan, dan nomor meja.
* **Opsi Pembayaran:** Pilihan antara **Tunai** atau **QRIS** di modal checkout.
* **Reset Otomatis:** Keranjang otomatis dikosongkan setelah pesanan dikirim.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (Vanilla)
* **Database & API:** Google Sheets
* **Backend Interface:** Google Apps Script (Web App)

---

## ⚙️ Cara Instalasi & Konfigurasi

Ikuti langkah-langkah ini untuk menjalankan aplikasi:

### 1. Persiapan File Lokal

1.  Unduh atau *clone* repositori ini.
2.  Pastikan Anda memiliki file-file berikut dalam satu folder:
    * `index.html`
    * `style.css`
    * `script.js`
    * `qris.jpg` (Gambar kode QRIS Anda, jika fitur QRIS diaktifkan).

### 2. Konfigurasi Google Apps Script (Sangat Penting!)

Agar aplikasi dapat mengambil data menu, Anda harus memastikan Google Apps Script Anda memiliki izin akses yang benar.

1.  Buka project **Google Apps Script** yang terhubung dengan Google Sheet menu Anda.
2.  Klik **Terapkan** (Deploy) > **Kelola Deployment** (Manage deployments).
3.  Klik **ikon pensil** (Edit) pada deployment yang aktif.
4.  Pastikan pengaturan **"Siapa yang memiliki akses"** (Who has access) diubah menjadi **"Siapa saja"** (Anyone).
5.  Klik **Terapkan** (Deploy) dan salin **URL Aplikasi Web** (`/exec`).

> ⚠️ **CATATAN PENTING:** Jika izin akses tidak disetel ke "Siapa saja", menu tidak akan tampil di GitHub Pages karena masalah CORS (Cross-Origin Resource Sharing), dan akan stuck di "Sedang mengambil menu...".

### 3. Edit File `script.js`

Buka file `script.js` dan ganti nilai konstanta di bagian atas file:

```javascript
// GANTI URL INI dengan URL Web App Google Apps Script Anda (/exec)
const SHEET_API_URL = 'PASTE_URL_WEB_APP_DISINI'; 

// Ganti dengan nomor WA Admin (format 62xxxxxxxxxx)
const NOMOR_WA_ADMIN = '628123456789'; 
