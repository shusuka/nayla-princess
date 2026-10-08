// Daftar klip suara Mimi (suara anak perempuan, ElevenLabs + olah nada ffmpeg).
// Klip dibuat sekali lewat `npm run suara`, lalu dipakai sebagai file statis
// di /public/suara. Jadi aplikasi tidak pernah memanggil API saat dipakai anak.

import { klipObrolan } from "./obrolan.js";

/** Semua hasil perkalian 1–10 (sekaligus mencakup hasil pembagian 1–10). */
export const ANGKA_SUARA = (() => {
  const set = new Set();
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      set.add(a);
      set.add(b);
      set.add(a * b);
    }
  }
  return [...set].sort((x, y) => x - y);
})();

export const KATA_SUARA = {
  kali: { id: "kata-kali", teks: "kali" },
  bagi: { id: "kata-dibagi", teks: "dibagi" },
  samaDengan: { id: "kata-sama-dengan", teks: "sama dengan" },
};

/** Kalimat tetap. `teks` dipakai untuk membuat mp3 sekaligus sebagai kunci pencarian. */
export const FRASA = [
  { id: "halo", teks: "Halo! Yuk belajar matematika!" },
  { id: "halo-mimi", teks: "Meong! Halo, aku Mimi!" },
  { id: "ayo-mulai", teks: "Ayo kita mulai!" },
  { id: "pujian-hebat", teks: "Hebat!" },
  { id: "pujian-keren", teks: "Keren sekali!" },
  { id: "pujian-pintar", teks: "Wah, pintar!" },
  { id: "pujian-hore", teks: "Horeee!" },
  { id: "pujian-jagoan", teks: "Kamu memang jagoan!" },
  { id: "pujian-mantap", teks: "Mantap!" },
  { id: "pujian-betul", teks: "Betul sekali!" },
  { id: "semangat-coba", teks: "Yuk coba lagi ya." },
  { id: "semangat-hampir", teks: "Hampir benar!" },
  { id: "semangat-tidakapa", teks: "Tidak apa-apa, ayo coba lagi." },
  { id: "semangat-pelan", teks: "Pelan-pelan saja." },
  { id: "semangat-pasti", teks: "Kamu pasti bisa!" },
  { id: "usaha-coba", teks: "Kamu mencoba lagi sampai berhasil!" },
  { id: "usaha-ikan", teks: "Kelompok ikannya membantu kamu menghitung." },
  { id: "bantu-hitung", teks: "Yuk kita hitung bersama! Lihat ikannya." },
  { id: "selesai-hebat", teks: "Hebat sekali! Kamu berhasil!" },
  { id: "selesai-bagus", teks: "Bagus! Terus berlatih ya." },
  { id: "hadiah-baru", teks: "Yeay! Kamu dapat hadiah baru!" },
  { id: "kucing-baru", teks: "Asyik! Ada teman kucing baru!" },
];

export const FRASA_BY_TEKS = Object.fromEntries(FRASA.map((f) => [f.teks, f.id]));

export function idAngka(n) {
  return `angka-${n}`;
}

const SATUAN = [
  "nol",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

/** Mengeja angka 0–100 dalam bahasa Indonesia, untuk dikirim ke ElevenLabs. */
export function ejaAngka(n) {
  if (n <= 11) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) {
    const puluh = Math.floor(n / 10);
    const sisa = n % 10;
    return `${SATUAN[puluh]} puluh${sisa ? ` ${SATUAN[sisa]}` : ""}`;
  }
  return "seratus";
}

/** Id klip kalimat utuh, misal "hitung-kali-3-4" atau "hitung-bagi-12-3". */
export function idHitung(jenis, a, b) {
  return `hitung-${jenis}-${a}-${b}`;
}

/** Semua fakta perkalian & pembagian 1–10 sebagai kalimat utuh (hanya untuk suara versi baru). */
export function klipHitung() {
  const hasil = [];
  for (let a = 1; a <= 10; a++) {
    for (let b = 1; b <= 10; b++) {
      hasil.push({ id: idHitung("kali", a, b), teks: `${ejaAngka(a)} kali ${ejaAngka(b)}, sama dengan ${ejaAngka(a * b)}.` });
      hasil.push({ id: idHitung("bagi", a * b, a), teks: `${ejaAngka(a * b)} dibagi ${ejaAngka(a)}, sama dengan ${ejaAngka(b)}.` });
    }
  }
  return hasil;
}

/** Semua klip yang perlu dibuat: [{ id, teks }] */
export function daftarKlip() {
  return [
    ...FRASA,
    ...klipObrolan(),
    ...Object.values(KATA_SUARA),
    ...ANGKA_SUARA.map((n) => ({ id: idAngka(n), teks: ejaAngka(n) })),
  ];
}
