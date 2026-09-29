// Data statis CatMath Adventure: level, kucing, toko, stiker.

export const LEVELS = [
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `x${i + 1}`,
    jenis: "kali",
    angka: i + 1,
    nama: `Perkalian ${i + 1}`,
    ikon: "✖️",
    warna: "#3d6bff",
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `d${i + 1}`,
    jenis: "bagi",
    angka: i + 1,
    nama: `Pembagian ${i + 1}`,
    ikon: "➗",
    warna: "#2fbf86",
  })),
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((l) => [l.id, l]));

export const KUCING = [
  {
    id: "mimi",
    nama: "Mimi",
    emoji: "🐱",
    harga: 0,
    sifat: "Ceria dan suka menghitung",
    warna: { bulu: "#ffffff", bulu2: "#dceeff", telinga: "#ffc0d9", mata: "#2f6ede", garis: "#bcd9f5" },
  },
  {
    id: "mochi",
    nama: "Mochi",
    emoji: "😺",
    harga: 60,
    sifat: "Lembut seperti kue mochi",
    warna: { bulu: "#fff2d8", bulu2: "#ffe2ae", telinga: "#ffc9a8", mata: "#8a5a2b", garis: "#f0cf9a" },
  },
  {
    id: "bobo",
    nama: "Bobo",
    emoji: "😸",
    harga: 120,
    sifat: "Suka tidur tapi pintar",
    warna: { bulu: "#dfe7f2", bulu2: "#c3d0e2", telinga: "#f4b8c8", mata: "#3b4b63", garis: "#a9b8cd" },
  },
  {
    id: "luna",
    nama: "Luna",
    emoji: "😻",
    harga: 200,
    sifat: "Berkilau seperti bulan",
    warna: { bulu: "#e6ddff", bulu2: "#cdbcff", telinga: "#ffc7ea", mata: "#6b46c1", garis: "#b8a4f0" },
  },
  {
    id: "coco",
    nama: "Coco",
    emoji: "😼",
    harga: 300,
    sifat: "Berani dan cepat berhitung",
    warna: { bulu: "#ffd9a8", bulu2: "#ffbc74", telinga: "#ff9f8a", mata: "#8a4a12", garis: "#eda75a" },
  },
  {
    id: "dotty",
    nama: "Dotty",
    emoji: "🐈",
    harga: 360,
    sifat: "Bulunya polkadot, suka pesta",
    // `totol` = warna bintik polkadot di bulunya
    warna: { bulu: "#fff6fb", bulu2: "#ffe0ef", telinga: "#ff9cc8", mata: "#c2327a", garis: "#f5b7d3", totol: "#ff8fc0" },
  },
];

export const KUCING_BY_ID = Object.fromEntries(KUCING.map((k) => [k.id, k]));

// Aksesori untuk Mimi & teman-teman. Satu slot hanya bisa dipakai satu barang.
// `kelas`: biasa | langka | istimewa — menentukan bingkai & efek kartu di butik.
// `koleksi`: "polkadot" untuk barang dari Koleksi Polkadot.
export const BARANG = [
  { id: "topi-pesta", nama: "Topi Pesta", slot: "topi", emoji: "🎉", harga: 30, kelas: "biasa" },
  { id: "topi-jerami", nama: "Topi Jerami", slot: "topi", emoji: "👒", harga: 45, kelas: "biasa" },
  { id: "mahkota", nama: "Mahkota", slot: "topi", emoji: "👑", harga: 90, kelas: "istimewa" },
  { id: "kacamata-bulat", nama: "Kacamata Bulat", slot: "kacamata", emoji: "👓", harga: 35, kelas: "biasa" },
  { id: "kacamata-hitam", nama: "Kacamata Keren", slot: "kacamata", emoji: "🕶️", harga: 70, kelas: "langka" },
  { id: "baju-garis", nama: "Baju Garis", slot: "baju", emoji: "👕", harga: 40, kelas: "biasa" },
  { id: "baju-pelaut", nama: "Baju Pelaut", slot: "baju", emoji: "🧥", harga: 80, kelas: "langka" },
  { id: "tas-ransel", nama: "Tas Ransel", slot: "tas", emoji: "🎒", harga: 55, kelas: "biasa" },
  { id: "tas-bintang", nama: "Tas Bintang", slot: "tas", emoji: "👜", harga: 85, kelas: "langka" },
  { id: "sepatu-lari", nama: "Sepatu Lari", slot: "sepatu", emoji: "👟", harga: 50, kelas: "biasa" },
  { id: "sepatu-bot", nama: "Sepatu Bot", slot: "sepatu", emoji: "🥾", harga: 75, kelas: "langka" },
  // ---- Koleksi Polkadot ----
  { id: "pita-polkadot", nama: "Pita Polkadot", slot: "topi", emoji: "🎀", harga: 65, kelas: "langka", koleksi: "polkadot" },
  { id: "tiara-polkadot", nama: "Tiara Polkadot", slot: "topi", emoji: "👑", harga: 150, kelas: "istimewa", koleksi: "polkadot" },
  { id: "kacamata-hati", nama: "Kacamata Hati Polkadot", slot: "kacamata", emoji: "💗", harga: 75, kelas: "langka", koleksi: "polkadot" },
  { id: "gaun-polkadot", nama: "Gaun Polkadot", slot: "baju", emoji: "👗", harga: 110, kelas: "istimewa", koleksi: "polkadot" },
  { id: "tas-polkadot", nama: "Tas Polkadot", slot: "tas", emoji: "👛", harga: 70, kelas: "langka", koleksi: "polkadot" },
  { id: "sepatu-polkadot", nama: "Sepatu Polkadot", slot: "sepatu", emoji: "🥿", harga: 80, kelas: "langka", koleksi: "polkadot" },
];

export const KELAS_BARANG = {
  biasa: { nama: "Lucu", warna: "#6ec6ff", warna2: "#3d6bff" },
  langka: { nama: "Langka", warna: "#c7a6ff", warna2: "#8a5cf6" },
  istimewa: { nama: "Istimewa", warna: "#ffd66b", warna2: "#d9921f" },
};

export const BARANG_BY_ID = Object.fromEntries(BARANG.map((b) => [b.id, b]));

export const SLOT_NAMA = {
  topi: "Topi",
  kacamata: "Kacamata",
  baju: "Baju",
  tas: "Tas",
  sepatu: "Sepatu",
};

export const GAME_LIST = [
  {
    id: "ikan",
    nama: "Tangkap Ikan",
    emoji: "🐟",
    warna: "#3d6bff",
    desc: "Sentuh ikan dengan jawaban yang benar.",
  },
  {
    id: "makan",
    nama: "Kasih Makan Kucing",
    emoji: "🍖",
    warna: "#ffb067",
    desc: "Beri makanan dengan angka yang tepat.",
  },
  {
    id: "balon",
    nama: "Balon Pecah",
    emoji: "🎈",
    warna: "#ff9bc4",
    desc: "Pecahkan balon berisi jawaban benar.",
  },
  {
    id: "tikus",
    nama: "Kejar Tikus",
    emoji: "🐭",
    warna: "#b79cff",
    desc: "Kejar tikus yang membawa jawaban benar.",
  },
  {
    id: "puzzle",
    nama: "Puzzle Gambar",
    emoji: "🧩",
    warna: "#2fbf86",
    desc: "Jawab benar untuk membuka gambar.",
  },
];

export const GAME_BY_ID = Object.fromEntries(GAME_LIST.map((g) => [g.id, g]));

// Gambar puzzle: emoji besar yang tertutup 9 kotak.
export const PUZZLE_GAMBAR = [
  { id: "kucing", emoji: "🐱", nama: "Kucing" },
  { id: "robot", emoji: "🤖", nama: "Robot" },
  { id: "mobil", emoji: "🚗", nama: "Mobil" },
  { id: "dino", emoji: "🦖", nama: "Dinosaurus" },
  { id: "roket", emoji: "🚀", nama: "Roket" },
  { id: "kue", emoji: "🎂", nama: "Kue Ulang Tahun" },
];

// Stiker prestasi. `cek` menerima state dan mengembalikan true bila tercapai.
export const STIKER = [
  {
    id: "langkah-pertama",
    nama: "Langkah Pertama",
    emoji: "🐾",
    desc: "Selesaikan level pertama",
    cek: (s) => Object.values(s.levels).some((l) => l.bintang > 0),
  },
  ...[2, 5, 8].map((n) => ({
    id: `jago-kali-${n}`,
    nama: `Jago Perkalian ${n}`,
    emoji: "⭐",
    desc: `Dapat 5 bintang di Perkalian ${n}`,
    cek: (s) => (s.levels[`x${n}`]?.bintang || 0) >= 5,
  })),
  ...[3, 8].map((n) => ({
    id: `ahli-bagi-${n}`,
    nama: `Ahli Pembagian ${n}`,
    emoji: "🏅",
    desc: `Dapat 5 bintang di Pembagian ${n}`,
    cek: (s) => (s.levels[`d${n}`]?.bintang || 0) >= 5,
  })),
  {
    id: "master-kali",
    nama: "Master Perkalian",
    emoji: "✖️",
    desc: "Selesaikan semua level perkalian",
    cek: (s) => LEVELS.filter((l) => l.jenis === "kali").every((l) => (s.levels[l.id]?.bintang || 0) > 0),
  },
  {
    id: "master-bagi",
    nama: "Master Pembagian",
    emoji: "➗",
    desc: "Selesaikan semua level pembagian",
    cek: (s) => LEVELS.filter((l) => l.jenis === "bagi").every((l) => (s.levels[l.id]?.bintang || 0) > 0),
  },
  {
    id: "master-1-10",
    nama: "Master 1–10",
    emoji: "🏆",
    desc: "Dapat 5 bintang di semua level",
    cek: (s) => LEVELS.every((l) => (s.levels[l.id]?.bintang || 0) >= 5),
  },
  {
    id: "rajin-3",
    nama: "Rajin 3 Hari",
    emoji: "🔥",
    desc: "Belajar 3 hari berturut-turut",
    cek: (s) => s.stats.streak >= 3,
  },
  {
    id: "rajin-7",
    nama: "Rajin 7 Hari",
    emoji: "🌈",
    desc: "Belajar 7 hari berturut-turut",
    cek: (s) => s.stats.streak >= 7,
  },
  {
    id: "kolektor",
    nama: "Kolektor Kucing",
    emoji: "😻",
    desc: "Buka 3 kucing atau lebih",
    cek: (s) => s.kucingTerbuka.length >= 3,
  },
  {
    id: "seratus",
    nama: "Seratus Benar",
    emoji: "💯",
    desc: "Jawab benar 100 soal",
    cek: (s) => s.stats.benar >= 100,
  },
];

// Kalimat semangat Mimi
export const PUJIAN = [
  "Hebat!",
  "Keren sekali!",
  "Wah, pintar!",
  "Horeee!",
  "Kamu memang jagoan!",
  "Mantap!",
  "Betul sekali!",
];

export const SEMANGAT = [
  "Yuk coba lagi ya.",
  "Hampir benar!",
  "Tidak apa-apa, ayo coba lagi.",
  "Pelan-pelan saja.",
  "Kamu pasti bisa!",
];
