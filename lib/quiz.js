// Pembuat soal perkalian & pembagian 1–10.

export function acak(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function angkaAcak(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buatPengecoh(jawab, jenis, angka, jumlah) {
  const kandidat = new Set();
  const tambah = (v) => {
    if (v > 0 && v !== jawab && Number.isInteger(v)) kandidat.add(v);
  };
  if (jenis === "kali") {
    tambah(jawab + angka);
    tambah(jawab - angka);
    tambah(jawab + 1);
    tambah(jawab - 1);
    tambah(jawab + 2);
    tambah(jawab - 2);
    tambah(jawab + angka * 2);
  } else {
    tambah(jawab + 1);
    tambah(jawab - 1);
    tambah(jawab + 2);
    tambah(jawab - 2);
    tambah(jawab + 3);
  }
  let daftar = acak([...kandidat]);
  let i = 1;
  while (daftar.length < jumlah) {
    const v = jawab + i;
    if (v !== jawab && !daftar.includes(v)) daftar.push(v);
    i++;
  }
  return daftar.slice(0, jumlah);
}

/**
 * Membuat satu soal.
 * jenis: "kali" | "bagi"
 * angka: angka utama level (1–10); bila null dipilih acak (mode campur)
 */
export function buatSoal({ jenis, angka = null, jumlahPilihan = 3, kedua = null }) {
  const n = angka ?? angkaAcak(1, 10);
  const k = kedua ?? angkaAcak(1, 10);
  let a;
  let b;
  let jawab;
  let teks;
  if (jenis === "kali") {
    a = n;
    b = k;
    jawab = a * b;
    teks = `${a} × ${b}`;
  } else {
    b = n;
    jawab = k;
    a = n * k;
    teks = `${a} ÷ ${b}`;
  }
  const pilihan = acak([jawab, ...buatPengecoh(jawab, jenis, n, jumlahPilihan - 1)]);
  return { a, b, jenis, jawab, teks, pilihan, kunci: `${jenis}:${a}:${b}` };
}

/** Deret soal untuk satu level: setiap pasangan 1–10 muncul sekali, diacak. */
export function soalLevel({ jenis, angka, jumlah = 10, jumlahPilihan = 3 }) {
  const pasangan = acak(Array.from({ length: 10 }, (_, i) => i + 1)).slice(0, jumlah);
  return pasangan.map((k) => buatSoal({ jenis, angka, kedua: k, jumlahPilihan }));
}

/** Soal campur untuk mini game / mode tantangan. */
export function soalCampur({ jenis = "campur", jumlah = 10, jumlahPilihan = 3, maksAngka = 10 }) {
  return Array.from({ length: jumlah }, () => {
    const j = jenis === "campur" ? (Math.random() < 0.5 ? "kali" : "bagi") : jenis;
    return buatSoal({
      jenis: j,
      angka: angkaAcak(1, maksAngka),
      kedua: angkaAcak(1, maksAngka),
      jumlahPilihan,
    });
  });
}

/**
 * Angka yang sudah dikuasai per jenis (level berbintang), ditambah satu angka baru
 * (level berikutnya yang belum selesai) sebagai sedikit tantangan.
 */
export function materiTerbuka(levels, jenis) {
  const dikuasai = [];
  let baru = null;
  for (let n = 1; n <= 10; n++) {
    const id = `${jenis === "kali" ? "x" : "d"}${n}`;
    if ((levels?.[id]?.bintang || 0) > 0) dikuasai.push(n);
    else if (baru === null) baru = n;
  }
  return { dikuasai, baru };
}

/**
 * Soal mini game sesuai kemampuan: ±80% dari angka yang sudah dikuasai, ±20% dari angka baru.
 * Pembagian baru ikut muncul di "campur" bila ada level pembagian yang sudah dikuasai.
 */
export function soalSesuaiKemampuan({ levels, jenis = "campur", jumlah = 10, jumlahPilihan = 3 }) {
  const kali = materiTerbuka(levels, "kali");
  const bagi = materiTerbuka(levels, "bagi");
  const daftarJenis = jenis === "campur" ? (bagi.dikuasai.length ? ["kali", "bagi"] : ["kali"]) : [jenis];
  const pilihAngka = (m) => {
    const pool = m.dikuasai.length ? m.dikuasai : [m.baru ?? 1];
    if (m.baru !== null && m.dikuasai.length && Math.random() < 0.2) return m.baru;
    return pool[Math.floor(Math.random() * pool.length)];
  };
  return Array.from({ length: jumlah }, () => {
    const j = daftarJenis[Math.floor(Math.random() * daftarJenis.length)];
    return buatSoal({ jenis: j, angka: pilihAngka(j === "kali" ? kali : bagi), kedua: angkaAcak(1, 10), jumlahPilihan });
  });
}

/** Ringkasan materi yang dipakai mini game, untuk ditampilkan ke anak. */
export function teksMateri(levels, jenis) {
  const m = materiTerbuka(levels, jenis);
  const daftar = m.dikuasai.length ? m.dikuasai : [m.baru ?? 1];
  const nama = jenis === "kali" ? "Perkalian" : "Pembagian";
  if (daftar.length >= 10) return `${nama} 1–10`;
  return `${nama} ${daftar.join(", ")}${m.dikuasai.length && m.baru ? ` + sedikit ${m.baru}` : ""}`;
}

export function bintangDari(benar, total) {
  const rasio = total ? benar / total : 0;
  if (rasio >= 1) return 5;
  if (rasio >= 0.9) return 4;
  if (rasio >= 0.8) return 3;
  if (rasio >= 0.7) return 2;
  if (rasio >= 0.5) return 1;
  return 0;
}
