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

- **Kucing chibi 3D** (`components/Kucing.jsx`): kepala mochi besar, mata berkilau, shading volumetrik
  + cahaya tepi (fresnel). Gerak idle berlapis dengan tempo berbeda (badan bernapas, kepala mengayun,
  telinga bergoyang, ekor melengkung seperti pegas) supaya tidak kaku. Mata & kepala mengikuti
  jari/kursor, kedip/tertawa/menguap acak, mulut bergerak saat Mimi berbicara. Bisa **dielus**:
  Mimi mendengkur dan keluar hati.
- **Ngobrol dengan Mimi** (`components/Obrolan.jsx`, isi di `lib/obrolan.js`): tombol *Ngobrol* di beranda
  membuka panel chat. Mimi bertanya dengan suara, anak menjawab lewat tombol besar: menanyakan kabar,
  tebak-tebakan (jawaban benar dapat +1 ikan), cerita fakta kucing, hobi, ajakan belajar/bermain.
- **Layar penuh**: tombol di bar atas (disembunyikan otomatis bila browser tidak mendukung, misal iPhone).
- Hewan lain (ikan, tikus, burung, kupu-kupu) ada di `components/Hewan.jsx`.
- Latar berlapis dengan parallax; **balon bisa diketuk sampai meletus** dan burung berkicau saat diketuk.
- Efek suara dibuat dengan Web Audio: marimba, glockenspiel, meong anak kucing, dengkur, cicit mainan,
  gelembung, fanfare.
- **Soundtrack 6 tema yang bergantian** (±75 detik per lagu): *Kotak Musik Mimi*, *Piknik Ceria* (ukulele),
  *Pesta Pantai* (steel drum), *Parade Mainan* (marching), *Awan Kapas* (lagu tidur), *Sirkus Kucing*.
  Semua dikarang sendiri dan dimainkan langsung oleh Web Audio, jadi **bebas lisensi** dan tanpa file mp3.
  Judul lagu tampil di beranda dengan tombol ganti lagu.
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

Suara Mimi adalah **suara anak perempuan**: klip **ElevenLabs** (suara bawaan *Jessica*, model
`eleven_flash_v2_5` dengan `language_code: "id"`) yang lalu diolah ffmpeg (`rubberband`:
nada + formant dinaikkan ×1,24, tempo tetap) dan disimpan sebagai file statis di `public/suara/`.

> Akun ElevenLabs tier gratis hanya boleh memakai suara *premade* lewat API — suara anak asli
> dari library (misal "Kak Ceria") dan Voice Design butuh paket berbayar. Bila nanti berlangganan,
> isi `ELEVENLABS_VOICE_ID` dengan suara anak tersebut dan `ANAK_NADA=1` di `.env.local`.

Aplikasi **tidak pernah memanggil API ElevenLabs saat dipakai** — jadi tidak ada
API key di browser, tidak ada biaya per pemakaian, dan suara tetap keluar walau
sedang offline. Kalimat "3 kali 4 sama dengan 12" dirangkai dari potongan angka
dan kata di sisi browser (hening di ujung klip dipotong otomatis lewat Web Audio).

Untuk membuat ulang klip (misalnya ingin ganti suara):

```bash
echo "ELEVENLABS_API_KEY=xxxxx" > .env.local
npm run suara -- --ulang     # rekam ulang semua (memakai kuota)
npm run suara -- --olah      # olah ulang nada dari rekaman mentah saja (tanpa kuota)
```

Rekaman mentah disimpan di `.suara-mentah/` (tidak di-commit). Butuh `ffmpeg` di PATH.

Ganti suara lewat `ELEVENLABS_VOICE_ID` (lihat `scripts/buat-suara.mjs`).
Daftar kalimat & angka ada di `lib/suara-daftar.js`, kalimat obrolan di `lib/obrolan.js`.

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
