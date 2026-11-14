# Product Requirements Document (PRD)

## Aplikasi Web Toko Milano (Toko Kelontong *Mobile-First* & Integrasi WhatsApp)

## 1. Ringkasan Eksekutif

Aplikasi web **Toko Milano** adalah platform pemesanan daring khusus untuk toko kelontong lokal yang dirancang dengan pendekatan *mobile-first* (dioptimalkan untuk layar ponsel). Aplikasi memungkinkan pembeli melihat ratusan produk kebutuhan harian secara cepat, menentukan titik antar melalui peta interaktif, menghitung ongkos kirim secara otomatis, serta menyelesaikan pesanan melalui WhatsApp tanpa perlu membuat akun atau mengingat kata sandi.

Di sisi operasional, pemilik **Toko Milano** dibekali **Panel Admin** responsif untuk mengelola ratusan stok barang (termasuk fitur impor massal dari Excel/CSV), menerima notifikasi pesanan masuk secara waktu nyata (*real-time*), dan memotong stok secara otomatis hanya ketika pesanan benar-benar dikonfirmasi.

## 2. Aturan Bisnis & Operasional (*Business Rules*)

1. **Model Harga & Katalog:** Seluruh barang di Toko Milano menggunakan harga satuan eceran. Katalog mendukung ratusan jenis barang yang dikelompokkan berdasarkan kategori.

2. **Strategi Gambar Produk:** Produk yang belum memiliki foto asli otomatis menampilkan ikon ilustrasi bawaan berdasarkan kategorinya (*category placeholder*). Foto asli dapat diunggah secara bertahap melalui Panel Admin.

3. **Belanja Tanpa Akun (*Guest Checkout*):** Pembeli tidak diwajibkan mendaftar atau *login*. Identitas pembeli (Nama, Nomor WhatsApp, dan Daftar Alamat beserta koordinat pin peta) disimpan secara otomatis di penyimpanan lokal peramban (*browser `localStorage`*) perangkat pembeli.

4. **Aturan Ongkos Kirim Otomatis (Peta Interaktif):**

   * Pembeli menentukan titik lokasi pengiriman pada peta (*OpenStreetMap*).

   * Sistem menghitung estimasi jarak tempuh dari koordinat Toko Milano ke titik pembeli menggunakan rumus matematika *Haversine* yang dikalikan faktor koreksi kelokan jalan sebesar $1,25$.

   * **Jarak** $\le 10\text{ km}$**:** Gratis Ongkir ($\text{Rp } 0$).

   * **Jarak** $> 10\text{ km}$**:** Dikenakan tarif datar (*flat rate*) sebesar $\text{Rp } 2.000$.

   * **Ambil Sendiri di Toko (*Self-Pickup*):** Gratis Ongkir ($\text{Rp } 0$).

5. **Jam Pengantaran Fleksibel:** Pembeli dapat memilih opsi **Antar Secepatnya** (bawaan/*default*) atau **Atur Jam Antar** dengan menuliskan catatan jam yang diinginkan.

6. **Metode Pembayaran:** Mendukung **Bayar di Tempat (*Cash on Delivery* / COD)** dan **QRIS** (menampilkan kode QRIS statis Toko Milano beserta nominal total tagihan sebelum dialihkan ke WhatsApp).

7. **Perlindungan Stok dari Pesanan Fiktif (*Fake Order*):** Stok barang di etalase **tidak langsung berkurang** saat pembeli menekan tombol konfirmasi. Stok baru berkurang secara atomik di basis data setelah admin menekan tombol **Terima Pesanan** di Panel Admin.

## 3. Arsitektur Teknis & Tumpukan Teknologi (*Tech Stack*)

Seluruh arsitektur dipilih agar berjalan optimal pada perangkat seluler berspesifikasi rendah maupun jaringan seluler yang lambat, dengan biaya operasional infrastruktur sebesar $\text{Rp } 0$ **(*free tier*)**:

| Lapisan Sistem | Teknologi | Fungsi & Alasan Pemilihan | 
| ----- | ----- | ----- | 
| **Frontend Framework** | **Next.js (App Router) + TypeScript** | Mendukung *Incremental Static Regeneration* (ISR) agar pemuatan ratusan produk di etalase terasa instan. | 
| **Styling & Ikon** | **Tailwind CSS + Lucide React** | Antarmuka ringan, responsif (*mobile-first*), dan menyediakan ikon kategori untuk *placeholder* produk. | 
| **Peta & Geolokasi** | **Leaflet (`react-leaflet`) + OpenStreetMap** | Peta interaktif gratis tanpa kunci API berbayar maupun kartu kredit penagihan (*billing*). | 
| **Backend & Database** | **Supabase (PostgreSQL)** | Basis data relasional dengan dukungan fungsi transaksi atomik (*RPC*) untuk menjaga akurasi stok. | 
| **Penyimpanan Gambar** | **Supabase Storage** | Kapasitas gratis $1\text{ GB}$, dikombinasikan dengan kompresi gambar sisi klien (`browser-image-compression`) menjadi format WebP ($\approx 100\text{ KB}$ per foto). | 
| **Notifikasi Waktu Nyata** | **Supabase Realtime** | Mendorong pesanan baru langsung ke layar Panel Admin disertai peringatan suara tanpa menyegarkan halaman. | 
| **Autentikasi Admin** | **Supabase Auth + RLS** | Mengamankan akses Panel Admin serta membatasi hak ubah stok dan status pesanan melalui *Row Level Security*. | 
| **Impor Massal Barang** | **SheetJS (`xlsx`) / `PapaParse`** | Membaca dan memvalidasi berkas Excel/CSV langsung di peramban admin sebelum dikirim massal ke basis data. | 
| **Hosting Frontend** | **Vercel** | Penyebaran (*deployment*) otomatis dengan jaringan distribusi konten (*CDN*) cepat di wilayah Asia Tenggara. | 

## 4. Spesifikasi Fitur Antarmuka Pembeli (*Customer View*)

### 4.1. Navigasi Bawah (*Bottom Navigation Bar*)

Bilah navigasi tetap (*fixed*) di bagian bawah layar ponsel dengan **3 menu utama**:

1. **Etalase** (Katalog belanja)

2. **Pesanan** (Riwayat transaksi & status pesanan)

3. **Profil** (Data diri & daftar alamat tersimpan)

### 4.2. Menu 1: Etalase (Beranda)

* **Header Toko:** Menampilkan nama toko (**Toko Milano**), indikator status **Buka / Tutup**, serta papan pengumuman (*banner*) info gratis ongkir $\le 10\text{ km}$.

* **Pencarian & Filter Kategori (*Sticky Header*):**

  * Bilah pencarian instan (*live search*) berdasarkan nama barang.

  * Tab kategori horizontal yang dapat digeser (*Sembako, Minuman, Makanan Ringan, Kebutuhan Mandi & Cuci, Bumbu Dapur, Obat & Lainnya*).

* **Katalog Produk (*Grid* 2 Kolom):**

  * Menampilkan foto produk (atau ikon *placeholder* kategori jika foto belum diunggah), nama barang beserta satuan eceran (contoh: *Minyak Goreng 1L*, *Telur Ayam 1 Butir*), harga, dan sisa stok.

  * Tombol aksi cepat (**`+`** dan **`-`**) langsung di kartu produk untuk menambah atau mengurangi jumlah barang di keranjang.

  * Jika stok $= 0$, kartu produk menampilkan lencana **"Habis"** dan tombol tambah dinonaktifkan.

* **Bilah Keranjang Melayang (*Floating Cart Bar*):** Muncul otomatis di atas navigasi bawah saat keranjang terisi ($\ge 1$ barang), menampilkan ringkasan jumlah item, subtotal harga, dan tombol **"Lanjut Pesan"**.

### 4.3. Alur Penyelesaian Pesanan (*Checkout*)

1. **Tinjau Keranjang:** Pembeli memeriksa daftar belanjaan, menyesuaikan kuantitas, atau menambahkan catatan khusus per barang (misalnya: *"pilih kemasan yang masih keras"*).

2. **Metode Pengambilan & Pin Peta Otomatis:**

   * Pembeli memilih **Diantar ke Alamat** atau **Ambil di Toko**.

   * Jika memilih **Diantar ke Alamat**, pembeli dapat memilih alamat tersimpan atau menentukan titik baru pada peta **OpenStreetMap** (dilengkapi tombol *"Gunakan Lokasi Saat Ini"* via GPS ponsel serta penanda pin yang dapat digeser manual).

   * Sistem langsung menampilkan estimasi jarak dalam kilometer dan rincian ongkos kirim ($\text{Rp } 0$ jika $\le 10\text{ km}$, atau $\text{Rp } 2.000$ jika $> 10\text{ km}$).

3. **Waktu Pengantaran:** Pilihan radio antara **Antar Secepatnya** atau **Atur Jam Antar** (memunculkan kolom teks singkat untuk mengisi jam).

4. **Metode Pembayaran:** Pilihan antara **COD (Bayar di Tempat)** atau **QRIS**.

5. **Konfirmasi & Integrasi WhatsApp:**

   * Saat tombol **Konfirmasi Pesanan** ditekan, sistem menyimpan pesanan ke basis data dengan status `PENDING` dan membuat nomor pesanan unik (contoh: `ORD-20261114-001`).

   * **Jika memilih QRIS:** Muncul layar instruksi pembayaran yang menampilkan gambar kode **QRIS Toko Milano**, nominal total yang harus ditransfer, serta tombol salin nominal sebelum beralih ke WhatsApp.

   * **Pengalihan ke WhatsApp:** Tombol **"Kirim Pesanan ke WhatsApp Toko"** membuka tautan `https://wa.me/{nomor_admin}?text={pesan_terformat}` berisi rekap lengkap pesanan.

#### Templat Format Pesan WhatsApp Otomatis

```
Halo Admin Toko Milano, saya ingin konfirmasi pesanan baru:

*No. Pesanan:* ORD-20261114-001
*Nama:* Budi Santoso
*No. WA:* 081234567890

*Daftar Belanja:*
1. Beras Ramos 5kg (1x) - Rp 72.000
2. Minyak Goreng 1L (2x) - Rp 34.000
   _Catatan: Kemasan pouch_

*Subtotal:* Rp 106.000
*Ongkos Kirim (4,2 km):* Rp 0 (Gratis)
*Total Tagihan:* Rp 106.000

*Pengiriman:* Diantar ke Alamat
*Waktu Antar:* Antar Secepatnya
*Alamat:* Jl. Melati No. 12, RT 02/RW 04 (Pagar warna hijau)
*Titik Peta:* https://www.openstreetmap.org/?mlat=-6.200000&mlon=106.816666#map=17/-6.200000/106.816666
*Metode Bayar:* COD

Mohon segera diproses ya, terima kasih!

```

### 4.4. Menu 2: Pesanan (Riwayat Transaksi)

* Menyimpan daftar nomor pesanan yang pernah dibuat dari perangkat pembeli pada `localStorage`, lalu mengambil status terbarunya secara langsung dari Supabase.

* Status pesanan yang ditampilkan: **Menunggu Konfirmasi**, **Diproses / Diantar**, **Selesai**, atau **Dibatalkan**.

* Dilengkapi tombol **"Pesan Lagi"** (*Reorder*) untuk menyalin seluruh barang dari pesanan sebelumnya ke keranjang belanja, serta tombol **"Tanya Admin via WA"**.

### 4.5. Menu 3: Profil & Daftar Alamat

* Formulir profil yang otomatis tersimpan di `localStorage`: **Nama Lengkap** dan **Nomor WhatsApp**.

* **Manajemen Multi-Alamat:** Pembeli dapat menyimpan beberapa alamat (contoh: *Rumah, Kontrakan, Tempat Kerja*), masing-masing menyimpan label alamat, detail jalan/patokan, serta koordinat titik peta (`latitude` dan `longitude`).

## 5. Spesifikasi Fitur Panel Admin (*Admin Dashboard*)

Panel admin **Toko Milano** diakses melalui rute `/admin` dan dilindungi halaman masuk (*login*) menggunakan email dan kata sandi admin.

1. **Ringkasan (*Dashboard Overview*):**

   * Kartu metrik hari ini: Total Pesanan Masuk, Pesanan Menunggu Konfirmasi, Estimasi Omzet Harian, dan Jumlah Produk Stok Menipis (stok $\le 3$).

2. **Manajemen Pesanan (*Real-time*):**

   * Daftar pesanan masuk secara waktu nyata lengkap dengan notifikasi suara saat ada pesanan baru berstatus `PENDING`.

   * Menampilkan rincian barang, jarak pengiriman, tautan titik peta pembeli, catatan jam antar, metode bayar, dan tombol balas langsung ke WhatsApp pembeli.

   * **Alur Status Pesanan:**

     * `PENDING` $\rightarrow$ **Terima Pesanan** (`PROCESSING`): Memicu fungsi basis data untuk memotong stok seluruh barang dalam pesanan tersebut secara otomatis.

     * `PROCESSING` $\rightarrow$ **Kirim / Siap Diambil** (`DELIVERING`) $\rightarrow$ **Selesai** (`COMPLETED`).

     * **Batalkan Pesanan** (`CANCELLED`): Jika pesanan dibatalkan setelah sebelumnya berstatus `PROCESSING` atau `DELIVERING`, sistem otomatis mengembalikan jumlah stok ke etalase.

3. **Manajemen Produk & Stok:**

   * **Tambah / Ubah Produk:** Input nama barang, kategori, harga eceran, satuan kemasan, jumlah stok, status aktif/nonaktif, dan unggah foto.

   * **Kompresi Gambar Otomatis:** Foto yang dipilih dari galeri atau kamera ponsel admin otomatis dikompresi di peramban sebelum diunggah ke Supabase Storage.

   * **Pembaruan Stok Cepat (*Quick Stock Update*):** Admin dapat mengubah angka stok atau menonaktifkan barang yang sedang kosong langsung dari tabel daftar produk tanpa membuka halaman edit.

   * **Impor Massal Excel/CSV (*Bulk Import*):**

     * Admin dapat mengunduh templat berkas `.xlsx` / `.csv` dengan kolom: `nama_produk`, `kategori`, `harga`, `stok`, `satuan`.

     * Kolom foto tidak diperlukan saat impor; seluruh produk hasil impor otomatis menggunakan ikon *placeholder* kategori sampai foto aslinya diunggah.

4. **Pengaturan Toko (*Store Settings*):**

   * Sakelar **Buka / Tutup Toko** (jika ditutup, tombol pemesanan di etalase otomatis dinonaktifkan dengan pemberitahuan toko sedang tutup).

   * Pemilih **Titik Koordinat Lokasi Toko Milano** pada peta OpenStreetMap sebagai titik pusat acuan perhitungan jarak $10\text{ km}$.

   * Unggah/ganti gambar kode **QRIS Toko Milano**.

   * Pengaturan **Nomor WhatsApp Admin** dan **Teks Spanduk Pengumuman** di halaman depan.

## 6. Perancangan Basis Data (*PostgreSQL Schema*)

### 6.1. Struktur Tabel Utama

1. **`store_settings`** (1 baris konfigurasi tunggal)

   * `id` (`int`, Primary Key, default `1`)

   * `store_name` (`text`, default `'Toko Milano'`)

   * `whatsapp_number` (`text`)

   * `is_open` (`boolean`, default `true`)

   * `announcement_text` (`text`)

   * `store_lat` (`double precision`) — *Garis lintang lokasi Toko Milano*

   * `store_lng` (`double precision`) — *Garis bujur lokasi Toko Milano*

   * `qris_image_url` (`text`, nullable)

   * `updated_at` (`timestamptz`)

2. **`categories`**

   * `id` (`uuid`, Primary Key)

   * `name` (`text`, Unique) — *Contoh: Sembako, Minuman, Bumbu Dapur*

   * `icon_name` (`text`) — *Nama ikon Lucide untuk placeholder produk*

   * `sort_order` (`int`, default `0`)

3. **`products`**

   * `id` (`uuid`, Primary Key)

   * `category_id` (`uuid`, Foreign Key $\rightarrow$ `categories.id`)

   * `name` (`text`)

   * `unit` (`text`) — *Contoh: 1 kg, 1 bungkus, 250 ml*

   * `price` (`integer`) — *Harga eceran dalam Rupiah*

   * `stock` (`integer`, default `0`)

   * `image_url` (`text`, nullable) — *Kosong/null jika masih memakai placeholder*

   * `is_active` (`boolean`, default `true`)

   * `created_at` (`timestamptz`)

4. **`orders`**

   * `id` (`uuid`, Primary Key)

   * `order_number` (`text`, Unique) — *Format: `ORD-YYYYMMDD-XXX`*

   * `customer_name` (`text`)

   * `customer_wa` (`text`)

   * `delivery_type` (`text`) — `'DELIVERY'` atau `'PICKUP'`

   * `delivery_time_note` (`text`) — `'Antar Secepatnya'` atau catatan jam khusus

   * `address_detail` (`text`, nullable)

   * `customer_lat` (`double precision`, nullable)

   * `customer_lng` (`double precision`, nullable)

   * `distance_km` (`numeric(5,2)`, default `0`)

   * `shipping_fee` (`integer`, default `0`) — `0` atau `2000`

   * `subtotal` (`integer`)

   * `total_amount` (`integer`)

   * `payment_method` (`text`) — `'COD'` atau `'QRIS'`

   * `status` (`text`, default `'PENDING'`) — `'PENDING'`, `'PROCESSING'`, `'DELIVERING'`, `'COMPLETED'`, `'CANCELLED'`

   * `stock_deducted` (`boolean`, default `false`)

   * `created_at` (`timestamptz`)

5. **`order_items`**

   * `id` (`uuid`, Primary Key)

   * `order_id` (`uuid`, Foreign Key $\rightarrow$ `orders.id` ON DELETE CASCADE)

   * `product_id` (`uuid`, Foreign Key $\rightarrow$ `products.id`)

   * `product_name` (`text`) — *Disimpan sebagai salinan historis saat transaksi*

   * `product_price` (`integer`)

   * `quantity` (`integer`)

   * `item_note` (`text`, nullable)

### 6.2. Keamanan Akses (*Row Level Security* / RLS)

* **Publik (*Anonymous*):**

  * `SELECT` diizinkan pada tabel `store_settings`, `categories`, `products` (hanya yang `is_active = true`), `orders`, dan `order_items`.

  * `INSERT` hanya diizinkan pada tabel `orders` dan `order_items` untuk membuat pesanan baru.

* **Admin Terautentikasi (*Authenticated*):**

  * Hak penuh (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) pada seluruh tabel.

## 7. Logika Perhitungan Jarak & Ongkos Kirim (*Haversine Formula*)

Untuk menghitung jarak antara titik koordinat **Toko Milano** $(\phi_1, \lambda_1)$ dan titik koordinat pin pembeli $(\phi_2, \lambda_2)$ dalam satuan kilometer tanpa layanan pihak ketiga berbayar, digunakan rumus *Haversine* dengan jari-jari bumi $R = 6.371\text{ km}$ dan faktor koreksi kelokan jalan raya sebesar $1,25$:

$$
\Delta\phi = \frac{(\phi_2 - \phi_1) \cdot \pi}{180}, \quad \Delta\lambda = \frac{(\lambda_2 - \lambda_1) \cdot \pi}{180}
$$

$$
a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\left(\frac{\phi_1 \cdot \pi}{180}\right) \cdot \cos\left(\frac{\phi_2 \cdot \pi}{180}\right) \cdot \sin^2\left(\frac{\Delta\lambda}{2}\right)
$$

$$
c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)
$$

$$
d_{\text{estimasi}} = R \cdot c \cdot 1,25
$$

Aturan penetapan tarif ongkos kirim berdasarkan hasil $d_{\text{estimasi}}$:

$$
\text{Ongkos Kirim} = \begin{cases} \text{Rp } 0, & \text{jika } d_{\text{estimasi}} \le 10\text{ km} \\ \text{Rp } 2.000, & \text{jika } d_{\text{estimasi}} > 10\text{ km} \end{cases}
$$

## 8. Tahapan Pengembangan (*Development Roadmap*)

* **Fase 1 — Penyiapan Infrastruktur & Basis Data:** Membuat proyek Supabase, mengeksekusi skrip tabel PostgreSQL, mengatur kebijakan RLS, membuat *bucket* penyimpanan gambar publik, dan membuat akun admin.

* **Fase 2 — Antarmuka Pembeli & Katalog:** Membangun kerangka Next.js *mobile-first* untuk **Toko Milano**, navigasi bawah 3 menu, etalase grid 2 kolom dengan *placeholder* kategori, pencarian instan, serta manajemen keranjang belanja dan profil berbasis `localStorage`.

* **Fase 3 — Integrasi Peta Otomatis & Checkout WhatsApp:** Mengintegrasikan komponen peta `react-leaflet`, menerapkan kalkulasi jarak *Haversine* untuk ongkir $> 10\text{ km}$, tampilan modal QRIS, dan generator tautan pesan otomatis WhatsApp.

* **Fase 4 — Panel Admin & Impor Massal:** Membangun halaman masuk admin, dasbor pesanan waktu nyata dengan notifikasi suara, pemotongan stok atomik, kompresi unggah foto produk, serta fitur impor massal Excel/CSV.

* **Fase 5 — Pengujian & Peluncuran:** Menguji akurasi pin peta di perangkat ponsel Android/iOS, menguji skenario pemotongan dan pengembalian stok, lalu merilis aplikasi **Toko Milano** ke Vercel.