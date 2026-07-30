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

export function bintangDari(benar, total) {
  const rasio = total ? benar / total : 0;
  if (rasio >= 1) return 5;
  if (rasio >= 0.9) return 4;
  if (rasio >= 0.8) return 3;
  if (rasio >= 0.7) return 2;
  if (rasio >= 0.5) return 1;
  return 0;
}
