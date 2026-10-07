// Obrolan bercabang dengan Mimi. Setiap kalimat Mimi punya klip suara sendiri
// (id "obr-*", dibuat lewat `npm run suara`), jadi anak bisa "mengobrol" sungguhan:
// Mimi bertanya, anak memilih jawaban, Mimi menanggapi.
//
// Simpul: { mimi: [idKalimat...], pilihan: [{ label, ikon, ke | aksi }] }
//   ke    -> lompat ke simpul lain
//   aksi  -> "belajar" | "main" | "tutup" | "tebak" | "fakta"

export const KALIMAT = {
  "obr-sapa": "Hai! Aku senang kamu datang. Mau ngobrol sama aku?",
  "obr-lagi": "Mau ngobrol apa lagi?",
  "obr-kabar": "Aku lagi senang sekali hari ini! Kalau kamu, perasaanmu bagaimana?",
  "obr-senang": "Wah, aku ikut senang! Senyummu bikin hariku cerah.",
  "obr-biasa": "Tidak apa-apa. Yuk kita bikin harimu jadi lebih seru!",
  "obr-sedih": "Sini, peluk dulu. Aku selalu ada untuk menemanimu.",
  "obr-capek": "Istirahat sebentar juga boleh, lho. Jangan lupa minum air putih ya.",
  "obr-tebak-mulai": "Asyik, tebak-tebakan! Dengarkan baik-baik ya.",
  "obr-betul": "Betul! Kamu pintar sekali!",
  "obr-hampir": "Hampir! Ayo kita lihat jawabannya.",
  "obr-tebak-lagi": "Mau tebak-tebakan lagi?",
  "obr-fakta-mulai": "Aku punya cerita seru tentang kucing. Tahukah kamu?",
  "obr-fakta-lagi": "Mau dengar cerita lainnya?",
  "obr-ajak-belajar": "Asyik! Aku sudah siap. Ayo kita ke kelas!",
  "obr-ajak-main": "Ayo main! Aku paling suka tangkap ikan.",
  "obr-nanti": "Oke, nanti saja. Aku tunggu ya!",
  "obr-dadah": "Dadah! Panggil aku lagi kalau mau ngobrol ya.",
  "obr-nama": "Kamu tahu tidak? Namaku Mimi, dan aku suka sekali berhitung!",
  "obr-hobi": "Aku suka main bola benang, tidur siang, dan makan ikan. Kalau kamu suka apa?",
  "obr-hobi-gambar": "Menggambar itu keren! Nanti gambar aku juga ya.",
  "obr-hobi-lari": "Wah, lari itu sehat! Aku juga suka kejar-kejaran.",
  "obr-hobi-nyanyi": "Nyanyi? Ayo kita nyanyi bersama. Meong meong!",
};

export const TEBAKAN = [
  {
    tanya: { id: "obr-tb1", teks: "Aku punya empat kaki, suka minum susu, dan bilang meong. Siapa aku?" },
    jelas: { id: "obr-tb1-j", teks: "Jawabannya kucing! Itu aku, hehe." },
    pilihan: [
      { label: "Kucing", benar: true },
      { label: "Ayam" },
      { label: "Ikan" },
    ],
  },
  {
    tanya: { id: "obr-tb2", teks: "Aku punya tiga ikan, lalu dapat dua lagi. Ikanku jadi berapa?" },
    jelas: { id: "obr-tb2-j", teks: "Tiga tambah dua sama dengan lima ikan. Nyam!" },
    pilihan: [
      { label: "4" },
      { label: "5", benar: true },
      { label: "6" },
    ],
  },
  {
    tanya: { id: "obr-tb3", teks: "Dua ekor kucing, masing-masing punya empat kaki. Semuanya berapa kaki?" },
    jelas: { id: "obr-tb3-j", teks: "Dua kali empat sama dengan delapan kaki!" },
    pilihan: [
      { label: "6" },
      { label: "4" },
      { label: "8", benar: true },
    ],
  },
  {
    tanya: { id: "obr-tb4", teks: "Benda apa yang punya jarum, tapi tidak bisa menjahit?" },
    jelas: { id: "obr-tb4-j", teks: "Jam dinding! Jarumnya berputar menunjukkan waktu." },
    pilihan: [
      { label: "Bantal" },
      { label: "Jam", benar: true },
      { label: "Pensil" },
    ],
  },
  {
    tanya: { id: "obr-tb5", teks: "Ada sepuluh kue, aku bagi rata untuk dua teman. Masing-masing dapat berapa?" },
    jelas: { id: "obr-tb5-j", teks: "Sepuluh dibagi dua sama dengan lima kue!" },
    pilihan: [
      { label: "5", benar: true },
      { label: "2" },
      { label: "8" },
    ],
  },
  {
    tanya: { id: "obr-tb6", teks: "Makin diisi makin ringan, bisa terbang tinggi. Apakah aku?" },
    jelas: { id: "obr-tb6-j", teks: "Balon! Kalau diisi udara, balon bisa melayang." },
    pilihan: [
      { label: "Batu" },
      { label: "Sepatu" },
      { label: "Balon", benar: true },
    ],
  },
];

export const FAKTA = [
  { id: "obr-fk1", teks: "Kucing bisa tidur dua belas jam sehari. Wah, banyak ya!" },
  { id: "obr-fk2", teks: "Setiap kucing punya pola hidung yang berbeda, seperti sidik jarimu." },
  { id: "obr-fk3", teks: "Kumis kucing membantunya tahu apakah badannya muat lewat celah." },
  { id: "obr-fk4", teks: "Kalau kucing mendengkur, biasanya ia sedang senang dan nyaman." },
  { id: "obr-fk5", teks: "Kucing bisa mendengar suara yang sangat pelan, lebih baik dari manusia." },
  { id: "obr-fk6", teks: "Anak kucing lahir dengan mata tertutup, lalu terbuka setelah satu minggu." },
];

const MENU_UTAMA = [
  { label: "Apa kabar, Mimi?", ikon: "hati", ke: "kabar" },
  { label: "Main tebak-tebakan!", ikon: "tanya", aksi: "tebak" },
  { label: "Cerita tentang kucing", ikon: "buku", aksi: "fakta" },
  { label: "Kamu suka apa?", ikon: "bintang", ke: "hobi" },
  { label: "Ayo belajar!", ikon: "pensil", ke: "ajak-belajar" },
  { label: "Ayo main game!", ikon: "main", ke: "ajak-main" },
];

const KEMBALI = [
  { label: "Ngobrol lagi", ikon: "obrolan", ke: "lagi" },
  { label: "Dadah, Mimi", ikon: "lambai", ke: "dadah" },
];

export const SIMPUL = {
  mulai: { mimi: ["obr-sapa"], pilihan: MENU_UTAMA },
  lagi: { mimi: ["obr-lagi"], pilihan: [...MENU_UTAMA, { label: "Dadah, Mimi", ikon: "lambai", ke: "dadah" }] },
  kabar: {
    mimi: ["obr-kabar"],
    pilihan: [
      { label: "Senang!", ikon: "senyum", ke: "kabar-senang" },
      { label: "Biasa saja", ikon: "datar", ke: "kabar-biasa" },
      { label: "Lagi sedih", ikon: "sedih", ke: "kabar-sedih" },
      { label: "Capek", ikon: "kantuk", ke: "kabar-capek" },
    ],
  },
  "kabar-senang": { mimi: ["obr-senang"], ekspresi: "senang", pilihan: KEMBALI },
  "kabar-biasa": { mimi: ["obr-biasa"], pilihan: KEMBALI },
  "kabar-sedih": { mimi: ["obr-sedih"], ekspresi: "sedih", peluk: true, pilihan: KEMBALI },
  "kabar-capek": { mimi: ["obr-capek"], pilihan: KEMBALI },
  hobi: {
    mimi: ["obr-nama", "obr-hobi"],
    pilihan: [
      { label: "Menggambar", ikon: "pensil", ke: "hobi-gambar" },
      { label: "Lari-lari", ikon: "api", ke: "hobi-lari" },
      { label: "Bernyanyi", ikon: "musik", ke: "hobi-nyanyi" },
    ],
  },
  "hobi-gambar": { mimi: ["obr-hobi-gambar"], ekspresi: "senang", pilihan: KEMBALI },
  "hobi-lari": { mimi: ["obr-hobi-lari"], ekspresi: "senang", pilihan: KEMBALI },
  "hobi-nyanyi": { mimi: ["obr-hobi-nyanyi"], ekspresi: "senang", pilihan: KEMBALI },
  "ajak-belajar": {
    mimi: ["obr-ajak-belajar"],
    pilihan: [
      { label: "Ayo!", ikon: "panah", aksi: "belajar" },
      { label: "Nanti saja", ikon: "jam", ke: "nanti" },
    ],
  },
  "ajak-main": {
    mimi: ["obr-ajak-main"],
    pilihan: [
      { label: "Ayo!", ikon: "panah", aksi: "main" },
      { label: "Nanti saja", ikon: "jam", ke: "nanti" },
    ],
  },
  nanti: { mimi: ["obr-nanti"], pilihan: KEMBALI },
  dadah: { mimi: ["obr-dadah"], ekspresi: "senang", pilihan: [{ label: "Dadah!", ikon: "lambai", aksi: "tutup" }] },
};

/** Teks kalimat Mimi berdasarkan id klip (untuk ditampilkan di gelembung chat). */
export const TEKS_OBROLAN = {
  ...KALIMAT,
  ...Object.fromEntries(TEBAKAN.flatMap((t) => [[t.tanya.id, t.tanya.teks], [t.jelas.id, t.jelas.teks]])),
  ...Object.fromEntries(FAKTA.map((f) => [f.id, f.teks])),
};

/** Semua klip obrolan: [{ id, teks }] */
export function klipObrolan() {
  return Object.entries(TEKS_OBROLAN).map(([id, teks]) => ({ id, teks }));
}
