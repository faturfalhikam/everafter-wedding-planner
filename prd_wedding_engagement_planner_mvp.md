# Product Requirements Document (PRD)
**Product Name:** [App Name] (Wedding & Engagement Planner)
**Document Status:** Draft - MVP Phase
**Target Platform:** Web / Mobile App (Cross-platform)

---

## 1. Product Overview
### 1.1. Problem Statement
Merencanakan pernikahan dan lamaran memiliki tingkat stres yang tinggi karena melibatkan banyak pihak, tenggat waktu yang ketat, dan biaya yang besar. Pasangan sering kali kebingungan harus mulai dari mana, kesulitan melacak status pembayaran vendor, dan sering mengalami *over budget* karena tidak adanya sistem pelacakan komitmen biaya (*committed budget*).

### 1.2. Product Vision
Menjadi "Personal Project Manager" yang memberikan ketenangan pikiran bagi pasangan yang sedang merencanakan acara pernikahan dan lamaran. 

### 1.3. Value Proposition
Bukan sekadar *to-do list* atau *marketplace* vendor, melainkan alat manajemen proyek cerdas yang otomatis membuatkan *timeline*, melacak *cashflow* (Paid, Committed, Available), dan memberikan peringatan dini terhadap pembengkakan *budget*.

---

## 2. MVP Objectives & Success Metrics
*   **Objective 1:** Validasi *core value* (Plan → Budget → Vendor → Execute) tanpa membangun *marketplace*.
*   **Objective 2:** Memastikan *user* mencapai "Aha! moment" di 3 menit pertama penggunaan melalui fitur *Onboarding Wizard*.
*   **Success Metrics:**
    *   **Activation Rate:** > 80% *user* yang mendaftar menyelesaikan *Onboarding Wizard* hingga *dashboard* terbuat.
    *   **Engagement:** Rata-rata *user* menambahkan/mengubah minimal 3 data (task/budget/vendor) pada minggu pertama.
    *   **Retention:** > 40% *user* aktif kembali (*Weekly Active Users*) hingga hari-H acara.

---

## 3. User Flow & Onboarding (The Wizard)
1.  **Sign Up:** Autentikasi dasar (Email/Google).
2.  **Wizard Step 1:** Jenis Acara (Lamaran / Pernikahan).
3.  **Wizard Step 2:** Tanggal Acara.
4.  **Wizard Step 3:** Estimasi Total Budget.
5.  **Wizard Step 4:** Estimasi Jumlah Tamu.
6.  **Wizard Step 5:** Konsep Acara (Indoor/Outdoor/Tradisional/Modern).
7.  **Processing:** Sistem melakukan duplikasi data dari `event_templates` (meng-generate puluhan *tasks*, kategori *budget*, dan *milestones*).
8.  **Dashboard:** *User* mendarat di *dashboard* yang sudah terisi data personalisasi.

---

## 4. Core Features Specifications (P0)

### 4.1. Dashboard Utama
*   **Deskripsi:** Pusat kendali acara.
*   **Komponen:**
    *   *Countdown* menuju hari-H.
    *   *Progress Bar* persentase *task* selesai.
    *   *Budget Snapshot* (Total Budget vs Actual Paid).
    *   *Widget Upcoming Tasks* (3 *task* terdekat berdasarkan *deadline*).

### 4.2. Smart Checklist & Timeline
*   **Deskripsi:** Manajemen tugas berbasis *template* dengan tenggat waktu relatif.
*   **Fungsionalitas:**
    *   Sistem otomatis menetapkan *deadline* berdasarkan formula `H - [X hari]`. (Contoh: "Booking Venue" H-270).
    *   Jika *user* mengubah tanggal acara di pengaturan, seluruh *deadline task* otomatis bergeser.
    *   *User* dapat menambahkan *task* manual, mengedit, menghapus, atau menandai selesai (✓).
    *   Tampilan *View*: *List View* (berdasarkan kategori) dan *Timeline View* (berdasarkan bulan eksekusi).

### 4.3. Budget Intelligence (Core Differentiator)
*   **Deskripsi:** Pelacakan anggaran komprehensif dengan sistem klasifikasi variansi.
*   **Fungsionalitas & Formula:**
    *   Sistem membedakan 3 pilar: 
        1.  **Budget:** Rencana awal.
        2.  **Paid:** Uang yang sudah ditransfer/dibayarkan.
        3.  **Committed:** Sisa kewajiban pembayaran dari kontrak yang sudah disepakati.
        4.  **Available:** `Budget - (Paid + Committed)`.
    *   **Variance Calculation:** 
        *   `variance_amount = actual_amount - budget_amount`
        *   `variance_percentage = (variance_amount / budget_amount) * 100`
    *   **Status Indicators (berlaku di level kategori & total):**
        *   `≤ -20%` : **Sangat Hemat** (Warna Hijau Tua)
        *   `> -20% s/d -10%` : **Hemat** (Warna Hijau Muda)
        *   `> -10% s/d 0%` : **Sesuai / Efisien** (Warna Hijau Netral)
        *   `0%` : **Pas Budget** (Warna Abu-abu/Biru)
        *   `> 0% s/d 10%` : **Sedikit Over** (Warna Kuning)
        *   `> 10% s/d 20%` : **Over Budget** (Warna Oranye)
        *   `> 20%` : **Sangat Over Budget** (Warna Merah)
    *   **Budget Health UI:** Progress bar visual yang menunjukkan persentase *Paid + Committed* terhadap *Total Budget*.

### 4.4. Vendor & Contract Management
*   **Deskripsi:** Direktori vendor pribadi milik *user* dan status pembayarannya.
*   **Fungsionalitas:**
    *   *User* dapat menambahkan vendor secara manual (Nama, Kategori, Harga, Kontak).
    *   *Status Pipeline*: Research → Contacted → Negotiation → Booked → Paid → Cancelled.
    *   **Integrasi ke Budget:** Saat vendor dipindahkan ke status "Booked", *user* memasukkan nilai kontrak. Nilai ini otomatis memperbarui angka *Committed* di modul Budget.
    *   **Manajemen Termin Pembayaran:** Mencatat histori pembayaran (DP 1, DP 2, Pelunasan). Pembayaran baru otomatis menambah angka *Paid* dan mengurangi angka *Committed*.

### 4.5. Guest List Sederhana
*   **Deskripsi:** Manajemen basis data tamu.
*   **Fungsionalitas:**
    *   Input nama tamu, grup (Keluarga/Teman/VIP/Kantor), dan status RSVP (Hadir/Tidak Hadir/Pending).
    *   Agregat hitungan total tamu (*Confirmed vs Pending*) yang tampil di *Dashboard*.

### 4.6. Couple Collaboration
*   **Deskripsi:** Mengundang pasangan untuk mengelola acara bersama.
*   **Fungsionalitas:**
    *   Role: `Owner` (Pembuat acara) dan `Editor` (Pasangan yang diundang).
    *   Keduanya dapat mengedit *task*, *budget*, dan vendor. Sinkronisasi data (*refresh-based* atau *basic real-time* jika infrastruktur memungkinkan).

---

## 5. Technical Architecture & Data Model (High-Level)

### 5.1. Database Schema Focus
Untuk memastikan arsitektur *template-driven* berjalan baik, pisahkan data referensi (*templates*) dan data transaksional (*events*).

*   **Template Tables:**
    *   `event_templates` (id, type: wedding/lamaran, name)
    *   `template_tasks` (id, template_id, title, relative_days_before_event)
    *   `template_budget_categories` (id, template_id, name, default_percentage_allocation)
*   **Transactional Tables:**
    *   `events` (id, user_id, type, event_date, total_budget, estimated_guests, status)
    *   `event_members` (id, event_id, user_id, role)
    *   `event_tasks` (id, event_id, title, deadline_date, status, linked_payment_id)
    *   `budget_categories` (id, event_id, name, budget_amount)
    *   `vendors` (id, event_id, category_id, name, total_contract_value, status)
    *   `vendor_payments` (id, vendor_id, amount, payment_date, type)

---

## 6. Out of Scope untuk MVP
Fitur-fitur berikut ditangguhkan ke fase V2/V3 untuk mempercepat *Time to Market*:
1.  Marketplace Vendor (Pencarian, *rating*, *review*).
2.  Payment Gateway terintegrasi (Bayar vendor via aplikasi).
3.  Website / Digital Invitation Builder.
4.  *Seating Arrangement Planner* (Visual *drag-and-drop*).
5.  *Chat* terintegrasi atau integrasi WhatsApp API.
6.  AI *Recommendation Engine*.