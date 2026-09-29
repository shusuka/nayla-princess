# CatMath Adventure 🐱💙

Aplikasi belajar **perkalian & pembagian 1–10** untuk anak SD, bertema biru dengan
kucing lucu bernama **Mimi**. Semuanya interaktif: animasi, efek suara, hadiah,
dan mini game — supaya belajar terasa seperti bermain, bukan mengerjakan PR.

## Isi aplikasi

| Halaman | Isi |
| --- | --- |
| **Beranda** (`/`) | Langit biru beranimasi (awan, balon, burung, rumput bergoyang), Mimi melambai, 4 tombol besar |
| **Belajar** (`/belajar`) | 20 level: Perkalian 1–10 lalu Pembagian 1–10, terbuka satu per satu |
| **Level** (`/belajar/x3`) | Tabel yang dibacakan Mimi → latihan 10 soal pilihan ganda → bintang & hadiah |
| **Mode Tantangan** (`/belajar/tantangan`) | Terbuka setelah semua level selesai: 15 soal campur, 4 pilihan |
| **Bermain** (`/main`) | 5 mini game: Tangkap Ikan, Kasih Makan Kucing, Balon Pecah, Kejar Tikus, Puzzle Gambar |
| **Hadiah** (`/hadiah`) | Butik Mimi: tukar 🐟 ikan dengan aksesori (termasuk **Koleksi Polkadot**), buka 6 kucing, koleksi stiker. Bisa "coba dulu" sebelum beli, dan setiap hadiah dibuka lewat animasi kado |
| **Orang Tua** (`/ortu`) | Lama belajar, jumlah soal, benar/salah, ketepatan, grafik 7 hari, materi yang masih sulit |

Prinsip yang dipakai:

- Jawaban salah **tidak pernah** dihukum — Mimi hanya bilang "Yuk coba lagi ya",
  anak boleh mencoba sampai benar.
- Tombol 💡 **Bantu aku** menampilkan konsepnya secara visual: perkalian sebagai
  kelompok ikan, pembagian sebagai ikan yang dibagi rata ke beberapa mangkuk.
- Semua kemajuan tersimpan di perangkat (`localStorage`), tidak dikirim ke server.

## Tampilan & interaksi

- **Kucing 3D yang hidup** (`components/Kucing.jsx`): shading volumetrik, mata & kepala mengikuti
  jari/kursor, kedip dan telinga berkedut acak, menguap, ekor mengibas. Bisa **dielus** (usap di atas
  kucing): Mimi mendengkur dan keluar hati.
- Hewan lain (ikan, tikus, burung, kupu-kupu) ada di `components/Hewan.jsx`.
- Latar berlapis dengan parallax; **balon bisa diketuk sampai meletus** dan burung berkicau saat diketuk.
- Efek suara dibuat dengan Web Audio: marimba, glockenspiel, meong anak kucing, dengkur, cicit mainan,
  gelembung, fanfare; musik latar ala kotak musik.
- Animasi memakai CSS + [Motion](https://motion.dev) (`motion/react`) dan menghormati `prefers-reduced-motion`.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run lint` | ESLint |
| `npm run suara` | Membuat ulang klip suara Mimi (butuh API key ElevenLabs) |

## Suara Mimi

Suara Mimi memakai klip **ElevenLabs** (suara bawaan *Jessica*, model
`eleven_flash_v2_5` dengan `language_code: "id"`) yang sudah dibuat sebelumnya dan
disimpan sebagai file statis di `public/suara/`.

Aplikasi **tidak pernah memanggil API ElevenLabs saat dipakai** — jadi tidak ada
API key di browser, tidak ada biaya per pemakaian, dan suara tetap keluar walau
sedang offline. Kalimat "3 kali 4 sama dengan 12" dirangkai dari potongan angka
dan kata di sisi browser (hening di ujung klip dipotong otomatis lewat Web Audio).

Untuk membuat ulang klip (misalnya ingin ganti suara):

```bash
echo "ELEVENLABS_API_KEY=xxxxx" > .env.local
npm run suara -- --ulang
```

Ganti suara lewat `ELEVENLABS_VOICE_ID` (lihat `scripts/buat-suara.mjs`).
Daftar kalimat & angka ada di `lib/suara-daftar.js`.

> `.env.local` sudah masuk `.gitignore`. **Jangan pernah** commit API key.

## Struktur

```
app/            halaman (App Router, semua halaman statis)
components/     Kucing.jsx (SVG kucing), Latar.jsx (langit), UI.jsx, LevelMain, GameMain
lib/            data.js (level/kucing/toko/stiker), quiz.js (pembuat soal),
                store.js (state + localStorage), sound.js (efek suara & suara Mimi)
public/suara/   klip mp3 suara Mimi
scripts/        buat-suara.mjs
```

Efek suara (meong, pop, konfeti, bel) dibuat langsung dengan Web Audio API,
jadi tidak ada file audio tambahan selain suara Mimi.

## Deploy

Proyek Next.js biasa — bisa langsung diimpor ke Vercel tanpa konfigurasi dan
tanpa environment variable apa pun (API key hanya dibutuhkan saat membuat klip suara).
