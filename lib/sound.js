// Semua efek suara & musik dibuat langsung dengan Web Audio API (tanpa file mp3):
// marimba, glockenspiel, meong anak kucing, dengkur, cicit mainan karet, gelembung, dll.
// Suara Mimi memakai klip ElevenLabs di /public/suara yang dibuat sekali lewat
// `npm run suara`; bila klip tidak ada, jatuh ke SpeechSynthesis.

import { ANGKA_SUARA, FRASA, FRASA_BY_TEKS, KATA_SUARA, idAngka } from "./suara-daftar";

let ctx = null;
let masterGain = null;
let efekGain = null;
let musikGain = null;
let bicaraGain = null;
let gemaKirim = null;

const pengaturan = { suara: true, musik: true, mimi: true };

// Suara Mimi diputar sedikit lebih cepat & tinggi supaya terdengar lebih imut.
const NADA_MIMI = 1.12;

export function setPengaturanAudio(p) {
  Object.assign(pengaturan, p);
  if (musikGain) musikGain.gain.value = pengaturan.musik ? 0.16 : 0;
  if (!pengaturan.musik) hentikanMusik();
  if (!pengaturan.mimi) hentikanBicara();
  if (!pengaturan.suara) hentikanDengkur();
}

/** Gema ruangan lembut, dibuat dari derau yang meluruh (tanpa file impuls). */
function buatGema(a) {
  const panjang = Math.floor(a.sampleRate * 1.6);
  const buf = a.createBuffer(2, panjang, a.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < panjang; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / panjang, 3.2);
  }
  const konv = a.createConvolver();
  konv.buffer = buf;
  return konv;
}

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    const kompresor = ctx.createDynamicsCompressor();
    kompresor.threshold.value = -16;
    kompresor.ratio.value = 4;
    kompresor.connect(ctx.destination);

    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(kompresor);

    const gema = buatGema(ctx);
    const gemaGain = ctx.createGain();
    gemaGain.gain.value = 0.28;
    gema.connect(gemaGain);
    gemaGain.connect(masterGain);
    gemaKirim = gema;

    efekGain = ctx.createGain();
    efekGain.gain.value = 1;
    efekGain.connect(masterGain);

    musikGain = ctx.createGain();
    musikGain.gain.value = pengaturan.musik ? 0.16 : 0;
    musikGain.connect(masterGain);

    bicaraGain = ctx.createGain();
    bicaraGain.gain.value = 1.1;
    bicaraGain.connect(kompresor);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

/** Dipanggil sekali setelah sentuhan pertama, karena browser memblokir audio otomatis. */
export function bangunkanAudio() {
  ac();
  if (pengaturan.musik) mulaiMusik();
  // Siapkan klip yang paling sering dipakai agar suara Mimi keluar tanpa jeda.
  if (pengaturan.mimi && typeof window !== "undefined") {
    FRASA.filter((f) => f.id.startsWith("pujian-") || f.id.startsWith("semangat-")).forEach((f) =>
      muatKlip(f.id).catch(() => {})
    );
  }
}

/* ---------------- Bahan dasar ---------------- */

function nada({
  freq,
  mulai = 0,
  durasi = 0.18,
  tipe = "sine",
  volume = 0.25,
  freqAkhir,
  tujuan,
  serang = 0.008,
  gema = 0,
  vibrato = 0,
  waktu,
}) {
  const a = ac();
  if (!a) return;
  const t = waktu ?? a.currentTime + mulai;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = tipe;
  osc.frequency.setValueAtTime(freq, t);
  if (freqAkhir) osc.frequency.exponentialRampToValueAtTime(freqAkhir, t + durasi);
  if (vibrato) {
    const lfo = a.createOscillator();
    const lg = a.createGain();
    lfo.frequency.value = 7;
    lg.gain.value = vibrato;
    lfo.connect(lg);
    lg.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + durasi + 0.05);
  }
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + serang);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  osc.connect(g);
  g.connect(tujuan || efekGain);
  if (gema && gemaKirim) {
    const kirim = a.createGain();
    kirim.gain.value = gema;
    g.connect(kirim);
    kirim.connect(gemaKirim);
  }
  osc.start(t);
  osc.stop(t + durasi + 0.05);
}

/** Marimba: nada dasar kayu + parsial tinggi yang cepat hilang. */
function marimba(freq, { mulai = 0, volume = 0.3, durasi = 0.5, tujuan, gema = 0.15, waktu } = {}) {
  nada({ freq, mulai, durasi, volume, tujuan, gema, serang: 0.004, waktu });
  nada({ freq: freq * 4, mulai, durasi: 0.07, volume: volume * 0.35, tujuan, serang: 0.002, waktu });
}

/** Glockenspiel / kotak musik: berkilau dan panjang. */
function glock(freq, { mulai = 0, volume = 0.18, durasi = 0.9, tujuan, gema = 0.5, waktu } = {}) {
  nada({ freq, mulai, durasi, volume, tujuan, gema, serang: 0.003, waktu });
  nada({ freq: freq * 2.76, mulai, durasi: durasi * 0.4, volume: volume * 0.3, tujuan, gema, serang: 0.002, waktu });
}

function derau({ mulai = 0, durasi = 0.2, volume = 0.2, frekuensi, q = 1, tipeFilter = "bandpass", frekuensiAkhir, tujuan, waktu }) {
  const a = ac();
  if (!a) return;
  const t = waktu ?? a.currentTime + mulai;
  const panjang = Math.max(1, Math.floor(a.sampleRate * durasi));
  const buf = a.createBuffer(1, panjang, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < panjang; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const g = a.createGain();
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  let simpul = src;
  if (frekuensi) {
    const f = a.createBiquadFilter();
    f.type = tipeFilter;
    f.frequency.setValueAtTime(frekuensi, t);
    if (frekuensiAkhir) f.frequency.exponentialRampToValueAtTime(frekuensiAkhir, t + durasi);
    f.Q.value = q;
    src.connect(f);
    simpul = f;
  }
  simpul.connect(g);
  g.connect(tujuan || efekGain);
  src.start(t);
}

/** Meong anak kucing: sumber bergerigi lewat filter "mulut" yang membuka lalu menutup. */
function meongKecil({ mulai = 0, tinggi = 1 } = {}) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + mulai;
  const osc = a.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(620 * tinggi, t);
  osc.frequency.linearRampToValueAtTime(980 * tinggi, t + 0.12);
  osc.frequency.linearRampToValueAtTime(860 * tinggi, t + 0.3);
  osc.frequency.exponentialRampToValueAtTime(540 * tinggi, t + 0.55);
  const lfo = a.createOscillator();
  const lg = a.createGain();
  lfo.frequency.value = 9;
  lg.gain.value = 18;
  lfo.connect(lg);
  lg.connect(osc.frequency);
  const mulut = a.createBiquadFilter();
  mulut.type = "bandpass";
  mulut.Q.value = 3.2;
  mulut.frequency.setValueAtTime(900, t);
  mulut.frequency.linearRampToValueAtTime(2300, t + 0.14);
  mulut.frequency.linearRampToValueAtTime(1100, t + 0.55);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.42, t + 0.05);
  g.gain.setValueAtTime(0.42, t + 0.32);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
  osc.connect(mulut);
  mulut.connect(g);
  g.connect(efekGain);
  if (gemaKirim) {
    const kirim = a.createGain();
    kirim.gain.value = 0.2;
    g.connect(kirim);
    kirim.connect(gemaKirim);
  }
  osc.start(t);
  lfo.start(t);
  osc.stop(t + 0.65);
  lfo.stop(t + 0.65);
}

// Tangga nada pentatonik C mayor: apa pun yang diketuk anak selalu terdengar merdu.
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
const acakDari = (arr) => arr[Math.floor(Math.random() * arr.length)];

const EFEK = {
  tap: () => marimba(acakDari(PENTA.slice(2, 7)), { volume: 0.22, durasi: 0.35 }),
  pilih: () => {
    nada({ freq: 380, durasi: 0.12, volume: 0.22, freqAkhir: 1250, serang: 0.004 });
    marimba(1046.5, { mulai: 0.05, volume: 0.12, durasi: 0.25 });
  },
  gelembung: () => nada({ freq: 300 + Math.random() * 200, durasi: 0.1, volume: 0.25, freqAkhir: 1400, serang: 0.003 }),
  benar: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => marimba(f, { mulai: i * 0.07, volume: 0.28 }));
    [1567.98, 2093].forEach((f, i) => glock(f, { mulai: 0.3 + i * 0.07, volume: 0.1 }));
  },
  // Tidak menghukum: bunyi "uh-oh" lembut yang lucu, bukan buzzer.
  salah: () => {
    nada({ freq: 520, durasi: 0.16, volume: 0.2, freqAkhir: 440, vibrato: 10 });
    nada({ freq: 400, mulai: 0.17, durasi: 0.3, volume: 0.2, freqAkhir: 300, vibrato: 14 });
  },
  meong: () => meongKecil({ tinggi: 1 + Math.random() * 0.15 }),
  cicit: () => {
    // mainan karet ditekan
    nada({ freq: 1400, durasi: 0.09, tipe: "triangle", volume: 0.2, freqAkhir: 2300, vibrato: 60 });
    nada({ freq: 2000, mulai: 0.09, durasi: 0.12, tipe: "triangle", volume: 0.16, freqAkhir: 1300, vibrato: 60 });
  },
  boing: () => nada({ freq: 180, durasi: 0.45, tipe: "sine", volume: 0.3, freqAkhir: 620, vibrato: 30 }),
  pop: () => {
    nada({ freq: 240, durasi: 0.09, volume: 0.35, freqAkhir: 1500, serang: 0.002 });
    derau({ durasi: 0.07, volume: 0.25, frekuensi: 3000, q: 0.8 });
    glock(1567.98, { mulai: 0.06, volume: 0.08, durasi: 0.5 });
  },
  koin: () => {
    glock(1975.53, { volume: 0.16, durasi: 0.25, gema: 0.2 });
    glock(2637.02, { mulai: 0.08, volume: 0.16, durasi: 0.6, gema: 0.3 });
  },
  bel: () => {
    glock(1174.66, { volume: 0.2, durasi: 1.2 });
    glock(1567.98, { mulai: 0.1, volume: 0.14, durasi: 1.2 });
  },
  kilau: () => {
    [1567.98, 2093, 2349.32, 2637.02, 3135.96].forEach((f, i) =>
      glock(f, { mulai: i * 0.045, volume: 0.07, durasi: 0.6 })
    );
  },
  kicau: () => {
    nada({ freq: 2600, durasi: 0.07, volume: 0.12, freqAkhir: 3900 });
    nada({ freq: 2800, mulai: 0.1, durasi: 0.09, volume: 0.12, freqAkhir: 4200 });
    nada({ freq: 3200, mulai: 0.22, durasi: 0.12, volume: 0.1, freqAkhir: 2400 });
  },
  hati: () => {
    marimba(783.99, { volume: 0.16, durasi: 0.3 });
    marimba(1046.5, { mulai: 0.09, volume: 0.16, durasi: 0.45 });
  },
  wus: () => derau({ durasi: 0.35, volume: 0.18, frekuensi: 400, frekuensiAkhir: 3200, q: 2 }),
  bintang: () => {
    [784, 988, 1175, 1568].forEach((f, i) => glock(f, { mulai: i * 0.09, volume: 0.14 }));
  },
  levelSelesai: () => {
    // fanfare kecil + tepuk tangan
    const melodi = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.51];
    const jeda = [0, 0.11, 0.22, 0.33, 0.52, 0.63, 0.78];
    melodi.forEach((f, i) => marimba(f, { mulai: jeda[i], volume: 0.3, durasi: i === 6 ? 1 : 0.4 }));
    [1046.5, 1318.51, 1567.98, 2093].forEach((f, i) => glock(f, { mulai: 0.78 + i * 0.06, volume: 0.1, durasi: 1.4 }));
    for (let i = 0; i < 10; i++)
      derau({ mulai: 0.9 + i * 0.07 + Math.random() * 0.03, durasi: 0.06, volume: 0.14, frekuensi: 1600, q: 0.7 });
  },
  tepuk: () => {
    for (let i = 0; i < 8; i++)
      derau({ mulai: i * 0.08 + Math.random() * 0.02, durasi: 0.07, volume: 0.16, frekuensi: 1500, q: 0.8 });
  },
  gendang: () => {
    // gulungan drum sebelum kotak hadiah terbuka
    for (let i = 0; i < 16; i++)
      derau({ mulai: i * 0.05, durasi: 0.05, volume: 0.05 + i * 0.008, frekuensi: 2200, q: 0.6 });
  },
  buka: () => {
    derau({ durasi: 0.4, volume: 0.12, frekuensi: 600, frekuensiAkhir: 5000, q: 1.5 });
    [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) =>
      glock(f, { mulai: 0.12 + i * 0.06, volume: 0.13, durasi: 1.1 })
    );
    marimba(523.25, { mulai: 0.12, volume: 0.25, durasi: 0.8 });
  },
};

export function sfx(nama) {
  if (!pengaturan.suara) return;
  const f = EFEK[nama];
  if (f) {
    try {
      f();
    } catch {
      /* audio tidak tersedia, abaikan */
    }
  }
}

/* ---------------- Dengkur (saat kucing dielus) ---------------- */

let dengkur = null;

export function mulaiDengkur() {
  if (!pengaturan.suara || dengkur) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime;
  const panjang = a.sampleRate * 2;
  const buf = a.createBuffer(1, panjang, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < panjang; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 320;
  const am = a.createGain();
  am.gain.value = 0;
  const lfo = a.createOscillator();
  lfo.frequency.value = 23;
  const lfoGain = a.createGain();
  lfoGain.gain.value = 0.5;
  lfo.connect(lfoGain);
  lfoGain.connect(am.gain);
  const bas = a.createOscillator();
  bas.frequency.value = 46;
  const basGain = a.createGain();
  basGain.gain.value = 0.25;
  bas.connect(basGain);
  basGain.connect(am);
  const akhir = a.createGain();
  akhir.gain.setValueAtTime(0.0001, t);
  akhir.gain.exponentialRampToValueAtTime(0.9, t + 0.25);
  src.connect(lp);
  lp.connect(am);
  am.connect(akhir);
  akhir.connect(efekGain);
  src.start(t);
  lfo.start(t);
  bas.start(t);
  dengkur = { src, lfo, bas, akhir };
  // bunyi hati kecil saat mulai dielus
  EFEK.hati();
}

export function hentikanDengkur() {
  if (!dengkur || !ctx) return;
  const { src, lfo, bas, akhir } = dengkur;
  dengkur = null;
  const t = ctx.currentTime;
  akhir.gain.cancelScheduledValues(t);
  akhir.gain.setValueAtTime(Math.max(0.0001, akhir.gain.value), t);
  akhir.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  [src, lfo, bas].forEach((n) => n.stop(t + 0.35));
}

/* ---------------- Suara Mimi ---------------- */

const ADA_ANGKA = new Set(ANGKA_SUARA);
const klipCache = new Map(); // id -> Promise<{buffer, mulai, durasi}>
let sumberAktif = [];

/** Mencari bagian yang benar-benar berbunyi, supaya hening di ujung klip terbuang. */
function batasBunyi(buffer, ambang = 0.012) {
  const data = buffer.getChannelData(0);
  let awal = 0;
  let akhir = data.length - 1;
  while (awal < data.length && Math.abs(data[awal]) < ambang) awal++;
  while (akhir > awal && Math.abs(data[akhir]) < ambang) akhir--;
  if (awal >= akhir) return { mulai: 0, durasi: buffer.duration };
  const jeda = Math.floor(buffer.sampleRate * 0.03);
  const m = Math.max(0, awal - jeda) / buffer.sampleRate;
  const a = Math.min(data.length - 1, akhir + jeda) / buffer.sampleRate;
  return { mulai: m, durasi: a - m };
}

function muatKlip(id) {
  if (klipCache.has(id)) return klipCache.get(id);
  const janji = (async () => {
    const a = ac();
    if (!a) throw new Error("audio tidak tersedia");
    const res = await fetch(`/suara/${id}.mp3`);
    if (!res.ok) throw new Error(`klip ${id} tidak ada`);
    const buffer = await a.decodeAudioData(await res.arrayBuffer());
    return { buffer, ...batasBunyi(buffer) };
  })();
  klipCache.set(id, janji);
  janji.catch(() => klipCache.delete(id));
  return janji;
}

function hentikanBicara() {
  sumberAktif.forEach((s) => {
    try {
      s.stop();
    } catch {
      /* sudah berhenti */
    }
  });
  sumberAktif = [];
  if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
}

/** Memutar beberapa klip berurutan tanpa jeda hening; pemutaran baru membatalkan yang lama. */
async function putarUrut(daftarId) {
  const a = ac();
  if (!a) return false;
  let klip;
  try {
    klip = await Promise.all(daftarId.map(muatKlip));
  } catch {
    return false;
  }
  hentikanBicara();
  let waktu = a.currentTime + 0.06;
  for (const k of klip) {
    const src = a.createBufferSource();
    src.buffer = k.buffer;
    src.playbackRate.value = NADA_MIMI;
    src.connect(bicaraGain);
    src.start(waktu, k.mulai, k.durasi);
    sumberAktif.push(src);
    waktu += k.durasi / NADA_MIMI + 0.04;
  }
  return true;
}

function suaraCadangan(teks) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    const suara = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang && v.lang.toLowerCase().startsWith("id"));
    if (suara) u.voice = suara;
    u.lang = "id-ID";
    u.rate = 1;
    u.pitch = 1.7;
    window.speechSynthesis.speak(u);
  } catch {
    /* abaikan */
  }
}

/** Mimi mengucapkan satu kalimat tetap (lihat FRASA di suara-daftar.js). */
export function bicara(teks) {
  if (!pengaturan.mimi) return;
  const id = FRASA_BY_TEKS[teks];
  if (!id) {
    suaraCadangan(teks);
    return;
  }
  putarUrut([id]).then((ok) => {
    if (!ok) suaraCadangan(teks);
  });
}

/** Mimi membacakan soal, misal: "tiga kali empat sama dengan dua belas". */
export function bicaraHitung({ jenis, a, b, jawab }) {
  if (!pengaturan.mimi) return;
  const angka = [a, b, jawab];
  const kata = jenis === "kali" ? KATA_SUARA.kali.id : KATA_SUARA.bagi.id;
  const teks =
    jenis === "kali" ? `${a} kali ${b} sama dengan ${jawab}` : `${a} dibagi ${b} sama dengan ${jawab}`;
  if (!angka.every((n) => ADA_ANGKA.has(n))) {
    suaraCadangan(teks);
    return;
  }
  putarUrut([idAngka(a), kata, idAngka(b), KATA_SUARA.samaDengan.id, idAngka(jawab)]).then((ok) => {
    if (!ok) suaraCadangan(teks);
  });
}

/* ---------------- Musik latar: kotak musik + marimba ---------------- */
// Dijadwalkan pakai jam AudioContext (bukan setInterval polos) supaya ritmenya tidak goyang.

const TEMPO = 100; // ketukan per menit
const LANGKAH = 60 / TEMPO / 2; // not 1/8
// C - Am - F - G, masing-masing 8 langkah
const AKOR = [
  [261.63, 329.63, 392.0],
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [196.0, 246.94, 293.66],
];
// 0 = diam; selain itu frekuensi melodi
const MELODI = [
  784, 0, 659.25, 784, 880, 0, 784, 659.25,
  659.25, 0, 523.25, 659.25, 784, 0, 659.25, 0,
  698.46, 0, 659.25, 587.33, 523.25, 0, 587.33, 659.25,
  587.33, 0, 783.99, 0, 587.33, 523.25, 587.33, 0,
];

let penjadwal = null;
let langkahMusik = 0;
let waktuBerikut = 0;

function jadwalkanLangkah(i, t) {
  const akor = AKOR[Math.floor(i / 8) % AKOR.length];
  const m = MELODI[i % MELODI.length];
  if (m) glock(m * 2, { waktu: t, volume: 0.1, durasi: 0.7, tujuan: musikGain, gema: 0.35 });
  if (m && i % 2 === 0) marimba(m, { waktu: t, volume: 0.22, durasi: 0.35, tujuan: musikGain, gema: 0.1 });
  // bas di ketukan 1 dan 3
  if (i % 4 === 0) nada({ freq: akor[0] / 2, waktu: t, durasi: 0.5, volume: 0.35, tujuan: musikGain, serang: 0.01 });
  // akor arpeggio lembut
  if (i % 8 === 2 || i % 8 === 6)
    akor.forEach((f, j) => marimba(f, { waktu: t + j * 0.03, volume: 0.1, durasi: 0.4, tujuan: musikGain, gema: 0.2 }));
  // shaker pelan di ketukan lemah
  if (i % 2 === 1) derau({ waktu: t, durasi: 0.04, volume: 0.05, frekuensi: 7000, q: 0.8, tipeFilter: "highpass", tujuan: musikGain });
}

export function mulaiMusik() {
  if (penjadwal || !pengaturan.musik) return;
  const a = ac();
  if (!a) return;
  langkahMusik = 0;
  waktuBerikut = a.currentTime + 0.1;
  penjadwal = setInterval(() => {
    if (!pengaturan.musik || !ctx) return;
    // tab sempat tersembunyi: lompati not yang terlewat, jangan diputar sekaligus
    if (waktuBerikut < ctx.currentTime) waktuBerikut = ctx.currentTime + 0.05;
    while (waktuBerikut < ctx.currentTime + 0.15) {
      jadwalkanLangkah(langkahMusik, waktuBerikut);
      waktuBerikut += LANGKAH;
      langkahMusik++;
    }
  }, 30);
}

export function hentikanMusik() {
  if (penjadwal) {
    clearInterval(penjadwal);
    penjadwal = null;
  }
}
