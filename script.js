// --- KONFIGURASI ---
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbxSuAK_j6V4P8XPBO9xcZpiVYEGO5FqyTn69Su-i5NjDDUnAI8XkA_O7G7nMqevBEI_/exec'; // GANTI URL INI
const NOMOR_WA_ADMIN = '6281225110044'; // GANTI NOMOR WA

let allProducts = [];
let cart = []; // Array untuk menyimpan belanjaan

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    // Listener
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('btnOpenCart').addEventListener('click', bukaModalKeranjang);
    document.getElementById('closeModal').addEventListener('click', tutupModal);
    document.getElementById('btnKirimWA').addEventListener('click', checkoutWA);
    
    // Klik luar modal tutup modal
    window.onclick = function(event) {
        if (event.target == document.getElementById('orderModal')) tutupModal();
    }
});

const formatRupiah = (num) => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', minimumFractionDigits:0}).format(num);

async function fetchProducts() {
    try {
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();
        allProducts = data;
        populateCategories(data);
        renderProducts(data);
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        document.getElementById('loading').innerHTML = 'Gagal memuat data.';
    }
}

function renderProducts(products) {
    const container = document.getElementById('productContainer');
    container.innerHTML = '';

    products.forEach(product => {
        const imgUrl = product.gambar ? product.gambar : 'https://via.placeholder.com/150';
        
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${imgUrl}" loading="lazy">
            <div class="card-body">
                <div class="category-tag">${product.kategori}</div>
                <h3 class="product-name">${product.nama}</h3>
                <div class="price">${formatRupiah(product.harga)}</div>
                <button class="btn-add" onclick="tambahKeKeranjang('${product.nama}')">+ Tambah</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- LOGIKA KERANJANG BELANJA ---

function tambahKeKeranjang(namaBarang) {
    // Cari data produk lengkap berdasarkan nama
    const produk = allProducts.find(p => p.nama === namaBarang);
    
    // Cek apakah barang sudah ada di keranjang
    const itemExisting = cart.find(item => item.nama === namaBarang);

    if (itemExisting) {
        itemExisting.qty += 1; // Jika ada, tambah jumlahnya
    } else {
        // Jika belum ada, masukkan sebagai item baru
        cart.push({
            nama: produk.nama,
            harga: produk.harga,
            qty: 1
        });
    }

    updateCartBadge();
    showToast(`"${namaBarang}" masuk keranjang`);
}

function updateCartBadge() {
    // Hitung total item (jumlah qty semua barang)
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').innerText = totalQty;
    
    // Animasi kecil di tombol
    const btn = document.getElementById('btnOpenCart');
    btn.style.transform = "scale(1.2)";
    setTimeout(() => btn.style.transform = "scale(1)", 200);
}

function bukaModalKeranjang() {
    renderCartList();
    document.getElementById('orderModal').style.display = "flex";
}

function tutupModal() {
    document.getElementById('orderModal').style.display = "none";
}

// Render daftar belanjaan di dalam Modal
function renderCartList() {
    const listContainer = document.getElementById('cartItemsList');
    listContainer.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#888;">Keranjang masih kosong.</p>';
        document.getElementById('cartTotalPrice').innerText = formatRupiah(0);
        return;
    }

    cart.forEach((item, index) => {
        const subtotal = item.harga * item.qty;
        grandTotal += subtotal;

        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.nama}</div>
                <div class="cart-item-price">@${formatRupiah(item.harga)}</div>
            </div>
            <div class="cart-controls">
                <button onclick="ubahQty(${index}, -1)">-</button>
                <span class="cart-qty">${item.qty}</span>
                <button onclick="ubahQty(${index}, 1)">+</button>
            </div>
        `;
        listContainer.appendChild(row);
    });

    document.getElementById('cartTotalPrice').innerText = formatRupiah(grandTotal);
}

// Fungsi tombol +/- di dalam modal
function ubahQty(index, change) {
    cart[index].qty += change;
    
    // Jika qty jadi 0, hapus dari array
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    
    renderCartList(); // Render ulang list di modal
    updateCartBadge(); // Update angka di tombol luar
}

// Fungsi untuk Menampilkan/Sembunyikan QRIS
function toggleQris(show) {
    const area = document.getElementById('qrisArea');
    if (show) {
        area.style.display = 'block';
    } else {
        area.style.display = 'none';
    }
}

// --- CHECKOUT KE WA ---
function checkoutWA() {
    if (cart.length === 0) {
        alert("Keranjang kosong!");
        return;
    }

    const nama = document.getElementById('inputNama').value.trim();
    const meja = document.getElementById('inputMeja').value.trim();
    
    // Ambil metode bayar
    const metodeRadio = document.querySelector('input[name="metodeBayar"]:checked');
    const metodeBayar = metodeRadio ? metodeRadio.value : "Tunai";

    if (!nama || !meja) {
        alert("Mohon isi Nama dan Nomor Meja!");
        return;
    }

    // 1. SUSUN PESAN (Gunakan \n untuk baris baru, bukan %0A)
    // Emoji aman digunakan di sini karena nanti akan di-encode otomatis
    let totalBayar = 0;
    cart.forEach(item => { totalBayar += item.harga * item.qty; });

    let pesan = `*PESANAN BARU!*\n` +
                `👤 Nama: ${nama}\n` +
                `🪑 Meja: ${meja}\n\n` +
                `*Rincian Pesanan:*\n`;
    
    cart.forEach(item => {
        const subtotal = item.harga * item.qty;
        pesan += `- ${item.nama} (${item.qty}x) = ${formatRupiah(subtotal)}\n`;
    });

    pesan += `\n*TOTAL: ${formatRupiah(totalBayar)}*\n`;
    pesan += `💳 *Pembayaran:* ${metodeBayar.toUpperCase()}\n`;
    
    if(metodeBayar === 'QRIS') {
        pesan += `(Bukti bayar mohon dilampirkan)\n`;
    }

    pesan += `\nMohon segera diproses. Terima kasih!`;

    // 2. BUKA WHATSAPP DENGAN ENCODE
    // encodeURIComponent akan mengubah Emoji jadi kode persen (misal: %F0%9F%91%A4) agar terbaca WA
    const urlWA = `https://wa.me/${NOMOR_WA_ADMIN}?text=${encodeURIComponent(pesan)}`;
    window.open(urlWA, '_blank');
    
    // 3. RESET DATA
    cart = [];
    updateCartBadge();
    renderCartList();
    
    // 4. RESET FORM
    document.getElementById('inputNama').value = "";
    document.getElementById('inputMeja').value = "";
    document.querySelector('input[value="Tunai"]').checked = true;
    toggleQris(false); 
    
    tutupModal();
    showToast("Pesanan diproses, keranjang dikosongkan.");
}

// Fitur Tambahan: Toast Notification
function showToast(message) {
    const x = document.getElementById("toast");
    x.innerText = message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}

// Fungsi Filter & Kategori tetap sama
function populateCategories(data) {
    const categories = [...new Set(data.map(item => item.kategori))];
    const select = document.getElementById('categoryFilter');
    select.innerHTML = '<option value="all">Semua Menu</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.text = cat;
        select.appendChild(option);
    });
}

function filterProducts() {
    const selected = document.getElementById('categoryFilter').value;
    const filtered = selected === 'all' ? allProducts : allProducts.filter(i => i.kategori === selected);
    renderProducts(filtered);
}