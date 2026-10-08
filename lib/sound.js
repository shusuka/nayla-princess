// Semua efek suara & musik dibuat langsung dengan Web Audio API (tanpa file mp3):
// marimba, glockenspiel, meong anak kucing, dengkur, cicit mainan karet, gelembung, dll.
// Suara Mimi memakai klip ElevenLabs di /public/suara yang dibuat sekali lewat
// `npm run suara`; bila klip tidak ada, jatuh ke SpeechSynthesis.

import { ANGKA_SUARA, FRASA, FRASA_BY_TEKS, KATA_SUARA, idAngka, idHitung } from "./suara-daftar";

let ctx = null;
let masterGain = null;
let efekGain = null;
let musikGain = null;
let bicaraGain = null;
let gemaKirim = null;

const pengaturan = { suara: true, musik: true, mimi: true, suaraLama: false };

// Suara baru (Edge TTS, /suara) diputar apa adanya. Suara lama (ElevenLabs + rubberband,
// /suara-lama) tetap dipercepat sedikit seperti dulu.
const nadaMimi = () => (pengaturan.suaraLama ? 1.04 : 1);
const folderSuara = () => (pengaturan.suaraLama ? "suara-lama" : "suara");

export function setPengaturanAudio(p) {
  if (p.suaraLama !== undefined && p.suaraLama !== pengaturan.suaraLama) hentikanBicara();
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
  const kunci = `${folderSuara()}/${id}`;
  if (klipCache.has(kunci)) return klipCache.get(kunci);
  const janji = (async () => {
    const a = ac();
    if (!a) throw new Error("audio tidak tersedia");
    const res = await fetch(`/${kunci}.mp3`);
    if (!res.ok) throw new Error(`klip ${id} tidak ada`);
    const buffer = await a.decodeAudioData(await res.arrayBuffer());
    return { buffer, ...batasBunyi(buffer) };
  })();
  klipCache.set(kunci, janji);
  janji.catch(() => klipCache.delete(kunci));
  return janji;
}

function hentikanBicara() {
  clearTimeout(bicaraSelesai);
  tandaBicara++;
  kabarBicara(false);
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

// Pemberi tahu "Mimi sedang berbicara" (dipakai untuk menggerakkan mulut kucing).
const pendengarBicara = new Set();
let tandaBicara = 0;
let bicaraSelesai = null;
let lagiBicara = false;
function kabarBicara(aktif) {
  if (lagiBicara === aktif) return;
  lagiBicara = aktif;
  pendengarBicara.forEach((fn) => fn(aktif));
}
/** true selama klip suara Mimi diputar (untuk useSyncExternalStore). */
export function sedangBicara() {
  return lagiBicara;
}
export function dengarBicara(fn) {
  pendengarBicara.add(fn);
  return () => pendengarBicara.delete(fn);
}

/**
 * Memutar beberapa klip berurutan; pemutaran baru membatalkan yang lama.
 * `jeda` = jarak antarklip (detik). Mengembalikan lama bicara (detik), atau 0 bila gagal.
 */
async function putarUrut(daftarId, jeda = 0.04) {
  const a = ac();
  if (!a) return 0;
  let klip;
  try {
    klip = await Promise.all(daftarId.map(muatKlip));
  } catch {
    return 0;
  }
  hentikanBicara();
  const laju = nadaMimi();
  let waktu = a.currentTime + 0.06;
  for (const [i, k] of klip.entries()) {
    if (i > 0) waktu += jeda;
    const src = a.createBufferSource();
    src.buffer = k.buffer;
    src.playbackRate.value = laju;
    // pudar masuk/keluar singkat supaya potongan klip tidak berbunyi "klik"
    const lama = k.durasi / laju;
    const g = a.createGain();
    g.gain.setValueAtTime(0, waktu);
    g.gain.linearRampToValueAtTime(1, waktu + 0.012);
    g.gain.setValueAtTime(1, waktu + lama - 0.025);
    g.gain.linearRampToValueAtTime(0, waktu + lama);
    src.connect(g);
    g.connect(bicaraGain);
    src.start(waktu, k.mulai, k.durasi);
    sumberAktif.push(src);
    waktu += lama;
  }
  const lama = waktu - a.currentTime;
  const tanda = ++tandaBicara;
  kabarBicara(true);
  bicaraSelesai = setTimeout(() => {
    if (tanda === tandaBicara) kabarBicara(false);
  }, lama * 1000);
  return lama;
}

function suaraCadangan(teks) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(teks);
    const indo = window.speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith("id"));
    // utamakan suara neural ("Natural"/"Online", misal Gadis di Edge) yang tidak terdengar robot
    const suara = indo.find((v) => /natural|online|gadis/i.test(v.name)) || indo[0];
    if (suara) u.voice = suara;
    u.lang = "id-ID";
    u.rate = 0.95;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  } catch {
    /* abaikan */
  }
}

/**
 * Mimi mengucapkan beberapa klip berurutan (misal kalimat obrolan) dengan jeda alami.
 * Mengembalikan Promise berisi lama bicara (detik); 0 bila suara Mimi mati / gagal.
 */
export async function bicaraKlip(daftarId, teksCadangan = "") {
  if (!pengaturan.mimi || !daftarId.length) return 0;
  const lama = await putarUrut(daftarId, 0.35);
  if (!lama && teksCadangan) suaraCadangan(teksCadangan);
  return lama;
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
  const sambung = () =>
    putarUrut([idAngka(a), kata, idAngka(b), KATA_SUARA.samaDengan.id, idAngka(jawab)], 0.09).then((ok) => {
      if (!ok) suaraCadangan(teks);
    });
  // Suara baru punya kalimat utuh per fakta; suara lama dirangkai per kata.
  if (pengaturan.suaraLama) {
    sambung();
    return;
  }
  putarUrut([idHitung(jenis, a, b)]).then((ok) => {
    if (!ok) sambung();
  });
}

/* ---------------- Musik latar: 6 lagu bertema yang bergantian ---------------- */
// Semua lagu dikarang sendiri & dimainkan langsung oleh Web Audio (tanpa file mp3),
// jadi bebas dipakai tanpa lisensi apa pun. Setiap lagu diputar ±75 detik lalu
// berganti ke tema berikutnya; anak/ortu juga bisa melompati lagu.
// Dijadwalkan pakai jam AudioContext (bukan setInterval polos) supaya ritmenya tidak goyang.

const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

function pluk(n, waktu, tujuan, volume = 0.1) {
  // petikan ukulele: segitiga + oktaf, cepat meluruh
  nada({ freq: hz(n), waktu, durasi: 0.38, tipe: "triangle", volume, tujuan, serang: 0.004, gema: 0.12 });
  nada({ freq: hz(n + 12), waktu, durasi: 0.12, volume: volume * 0.35, tujuan, serang: 0.002 });
}
function steelpan(n, waktu, tujuan, volume = 0.16) {
  const f = hz(n);
  nada({ freq: f, waktu, durasi: 0.55, volume, tujuan, serang: 0.004, gema: 0.25 });
  nada({ freq: f * 2.01, waktu, durasi: 0.3, volume: volume * 0.45, tujuan, serang: 0.003 });
  nada({ freq: f * 3.02, waktu, durasi: 0.14, volume: volume * 0.18, tujuan, serang: 0.002 });
}
function siul(n, waktu, tujuan, durasi = 0.32, volume = 0.1) {
  nada({ freq: hz(n), waktu, durasi, volume, tujuan, serang: 0.03, vibrato: 5, gema: 0.3 });
}
function kazoo(n, waktu, tujuan, durasi = 0.22, volume = 0.05) {
  nada({ freq: hz(n), waktu, durasi, tipe: "square", volume, tujuan, serang: 0.02, vibrato: 7, gema: 0.15 });
  nada({ freq: hz(n), waktu, durasi, volume: volume * 1.6, tujuan, serang: 0.02 });
}
function bas(n, waktu, tujuan, durasi = 0.32, volume = 0.3) {
  nada({ freq: hz(n), waktu, durasi, volume, tujuan, serang: 0.01 });
  nada({ freq: hz(n + 12), waktu, durasi: durasi * 0.5, tipe: "triangle", volume: volume * 0.25, tujuan, serang: 0.01 });
}
function kick(waktu, tujuan, volume = 0.38) {
  nada({ freq: 150, freqAkhir: 48, waktu, durasi: 0.18, volume, tujuan, serang: 0.002 });
}
function snare(waktu, tujuan, volume = 0.09) {
  derau({ waktu, durasi: 0.12, volume, frekuensi: 1900, q: 0.7, tujuan });
}
function hihat(waktu, tujuan, volume = 0.04) {
  derau({ waktu, durasi: 0.035, volume, frekuensi: 7500, q: 0.8, tipeFilter: "highpass", tujuan });
}
function tepukTangan(waktu, tujuan, volume = 0.07) {
  derau({ waktu, durasi: 0.06, volume, frekuensi: 1500, q: 0.9, tujuan });
  derau({ waktu: waktu + 0.012, durasi: 0.07, volume: volume * 0.8, frekuensi: 1300, q: 0.9, tujuan });
}
function konga(waktu, tujuan, tinggi = 1) {
  nada({ freq: 260 * tinggi, freqAkhir: 200 * tinggi, waktu, durasi: 0.16, volume: 0.16, tujuan, serang: 0.003 });
}
function pad(nadaAkor, waktu, durasi, tujuan, volume = 0.03) {
  nadaAkor.forEach((n) => {
    nada({ freq: hz(n) * 0.997, waktu, durasi, tipe: "triangle", volume, tujuan, serang: 0.4, gema: 0.4 });
    nada({ freq: hz(n) * 1.003, waktu, durasi, tipe: "triangle", volume, tujuan, serang: 0.4 });
  });
}

// Akor ditulis sebagai nomor MIDI. Melodi: 64 langkah not 1/8 (dua frasa), 0 = diam.
const LAGU = [
  {
    nama: "Kotak Musik Mimi",
    tempo: 100,
    akor: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]],
    melodi: [
      79, 0, 76, 79, 81, 0, 79, 76, 76, 0, 72, 76, 79, 0, 76, 0,
      77, 0, 76, 74, 72, 0, 74, 76, 74, 0, 79, 0, 74, 72, 74, 0,
      79, 0, 76, 79, 84, 0, 81, 79, 76, 0, 72, 76, 79, 0, 81, 0,
      77, 0, 81, 79, 77, 76, 74, 0, 74, 76, 74, 71, 72, 0, 0, 0,
    ],
    main(i, t, a, m, g) {
      if (m) glock(hz(m) * 2, { waktu: t, volume: 0.1, durasi: 0.7, tujuan: g, gema: 0.35 });
      if (m && i % 2 === 0) marimba(hz(m), { waktu: t, volume: 0.2, durasi: 0.35, tujuan: g, gema: 0.1 });
      if (i % 4 === 0) bas(a[0] - 12, t, g, 0.5, 0.32);
      if (i % 8 === 2 || i % 8 === 6)
        a.forEach((n, j) => marimba(hz(n), { waktu: t + j * 0.03, volume: 0.09, durasi: 0.4, tujuan: g, gema: 0.2 }));
      if (i % 2 === 1) hihat(t, g, 0.04);
    },
  },
  {
    nama: "Piknik Ceria",
    tempo: 116,
    akor: [[53, 57, 60], [48, 52, 55], [50, 53, 57], [46, 50, 53]],
    melodi: [
      72, 0, 74, 72, 69, 0, 65, 0, 67, 0, 69, 67, 64, 0, 60, 0,
      65, 67, 69, 0, 72, 0, 69, 67, 65, 0, 62, 0, 65, 0, 0, 0,
      72, 74, 76, 0, 77, 76, 74, 72, 74, 0, 72, 0, 67, 0, 0, 0,
      69, 0, 72, 0, 74, 72, 69, 0, 70, 69, 67, 0, 65, 0, 0, 0,
    ],
    main(i, t, a, m, g) {
      if (m) siul(m + 12, t, g, 0.3, 0.07);
      // genjrengan ukulele: pola ketukan khas "dum, dum-dum, dum-dum"
      if ([0, 2, 3, 5, 6].includes(i % 8)) a.forEach((n, j) => pluk(n + 12, t + j * 0.014, g, i % 8 === 0 ? 0.09 : 0.06));
      if (i % 4 === 0) bas(a[0] - 12, t, g);
      if (i % 8 === 2 || i % 8 === 6) tepukTangan(t, g, 0.05);
      hihat(t, g, i % 2 ? 0.025 : 0.04);
    },
  },
  {
    nama: "Pesta Pantai",
    tempo: 124,
    akor: [[60, 64, 67], [53, 57, 60], [55, 59, 62], [60, 64, 67]],
    melodi: [
      72, 0, 72, 76, 0, 79, 0, 76, 77, 0, 76, 74, 0, 72, 0, 69,
      71, 0, 74, 0, 79, 0, 77, 74, 76, 0, 72, 0, 72, 0, 0, 0,
      79, 0, 79, 76, 0, 72, 0, 76, 81, 0, 79, 77, 0, 76, 0, 77,
      79, 0, 77, 0, 74, 0, 71, 0, 72, 0, 0, 76, 79, 0, 84, 0,
    ],
    main(i, t, a, m, g) {
      if (m) steelpan(m, t, g, 0.13);
      const s = i % 8;
      // bas calypso yang melompat
      if (s === 0) bas(a[0] - 12, t, g, 0.25);
      if (s === 3) bas(a[2] - 12, t, g, 0.2, 0.24);
      if (s === 4) bas(a[0] - 12, t, g, 0.2, 0.26);
      if (s === 6) bas(a[1] - 12, t, g, 0.2, 0.22);
      if (s === 2 || s === 5) a.forEach((n) => pluk(n, t, g, 0.04));
      if (s === 0 || s === 4) kick(t, g, 0.3);
      if (s === 3) konga(t, g, 1);
      if (s === 6 || s === 7) konga(t, g, 1.35);
      hihat(t, g, 0.03);
    },
  },
  {
    nama: "Parade Mainan",
    tempo: 112,
    akor: [[55, 59, 62], [48, 52, 55], [50, 54, 57], [55, 59, 62]],
    melodi: [
      67, 0, 71, 0, 74, 0, 71, 0, 72, 0, 76, 0, 79, 0, 76, 0,
      74, 0, 78, 0, 81, 0, 78, 74, 79, 0, 74, 0, 67, 0, 0, 0,
      79, 78, 79, 0, 74, 0, 71, 0, 76, 74, 76, 0, 72, 0, 67, 0,
      69, 71, 72, 74, 76, 78, 81, 0, 79, 0, 0, 0, 67, 0, 0, 0,
    ],
    main(i, t, a, m, g) {
      if (m) glock(hz(m) * 2, { waktu: t, volume: 0.09, durasi: 0.5, tujuan: g, gema: 0.25 });
      if (m) pluk(m, t, g, 0.05);
      const s = i % 8;
      // "oom-pah": bas di ketukan berat, akor di ketukan ringan
      if (s === 0) bas(a[0] - 12, t, g, 0.25);
      if (s === 4) bas(a[2] - 24, t, g, 0.25);
      if (s === 2 || s === 6) a.forEach((n) => pluk(n, t, g, 0.05));
      if (s === 0 || s === 4) kick(t, g, 0.25);
      if (s === 2 || s === 6) snare(t, g, 0.07);
      // gulungan drum kecil tiap dua birama
      if (i % 16 === 15) [0, 0.06, 0.12].forEach((d) => snare(t + d, g, 0.05));
    },
  },
  {
    nama: "Awan Kapas",
    tempo: 84,
    akor: [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]],
    melodi: [
      74, 0, 0, 73, 74, 0, 76, 0, 78, 0, 0, 76, 74, 0, 0, 0,
      71, 0, 74, 0, 79, 0, 78, 0, 76, 0, 0, 0, 73, 0, 0, 0,
      78, 0, 0, 76, 78, 0, 81, 0, 83, 0, 81, 0, 78, 0, 0, 0,
      79, 0, 78, 0, 76, 0, 74, 0, 73, 0, 76, 0, 74, 0, 0, 0,
    ],
    main(i, t, a, m, g) {
      if (m) glock(hz(m) * 2, { waktu: t, volume: 0.11, durasi: 1.2, tujuan: g, gema: 0.55 });
      // arpeggio kotak musik yang mengalun
      const arp = [a[0], a[1], a[2], a[1] + 12];
      marimba(hz(arp[i % 4]), { waktu: t, volume: 0.07, durasi: 0.6, tujuan: g, gema: 0.3 });
      if (i % 8 === 0) {
        pad(a, t, LANGKAH_DARI(84) * 8, g, 0.025);
        bas(a[0] - 12, t, g, 1.2, 0.22);
      }
    },
  },
  {
    nama: "Sirkus Kucing",
    tempo: 132,
    akor: [[60, 64, 67], [53, 57, 60], [55, 59, 65], [60, 64, 67]],
    melodi: [
      76, 77, 79, 0, 76, 0, 72, 0, 77, 76, 77, 0, 81, 0, 77, 0,
      79, 77, 76, 74, 71, 0, 74, 0, 72, 0, 76, 0, 72, 0, 0, 0,
      84, 0, 83, 0, 81, 0, 79, 0, 77, 0, 81, 0, 84, 0, 81, 0,
      79, 0, 77, 0, 74, 0, 71, 74, 72, 0, 67, 0, 72, 0, 0, 0,
    ],
    main(i, t, a, m, g) {
      if (m) kazoo(m, t, g);
      if (m && i % 2 === 0) glock(hz(m) * 2, { waktu: t, volume: 0.05, durasi: 0.3, tujuan: g });
      const s = i % 4;
      if (s === 0) bas(i % 8 === 0 ? a[0] - 12 : a[2] - 24, t, g, 0.2);
      if (s === 2) a.forEach((n) => pluk(n, t, g, 0.05));
      if (s === 0) kick(t, g, 0.22);
      if (s === 2) snare(t, g, 0.06);
      if (i % 32 === 31) glock(hz(96), { waktu: t, volume: 0.08, durasi: 0.6, tujuan: g });
    },
  },
];

function LANGKAH_DARI(tempo) {
  return 60 / tempo / 2; // not 1/8
}

const LAMA_LAGU = 75; // detik per lagu sebelum berganti tema

let penjadwal = null;
let lagu = null; // { indeks, gain, langkah, waktuBerikut, mulai, ganti }
let urutanLagu = 0;
const pendengarLagu = new Set();

let infoLaguSekarang = null;

function kabarkanLagu() {
  infoLaguSekarang = lagu ? { indeks: lagu.indeks, nama: LAGU[lagu.indeks].nama, jumlah: LAGU.length } : null;
  pendengarLagu.forEach((fn) => fn());
}

/** Info lagu yang sedang diputar (objek tetap sampai lagu berganti; cocok untuk useSyncExternalStore). */
export function infoLagu() {
  return infoLaguSekarang;
}

/** Berlangganan perubahan lagu. Mengembalikan fungsi berhenti. */
export function dengarLagu(fn) {
  pendengarLagu.add(fn);
  return () => pendengarLagu.delete(fn);
}

export const DAFTAR_LAGU = LAGU.map((l) => l.nama);

function mulaiLagu(indeks, waktu) {
  const a = ac();
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, waktu);
  g.gain.exponentialRampToValueAtTime(1, waktu + 1.2);
  g.connect(musikGain);
  lagu = { indeks, gain: g, langkah: 0, waktuBerikut: waktu, mulai: waktu };
  kabarkanLagu();
}

function pudarkan(g, waktu, lama = 1.2) {
  g.gain.cancelScheduledValues(waktu);
  g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), waktu);
  g.gain.exponentialRampToValueAtTime(0.0001, waktu + lama);
  setTimeout(() => g.disconnect(), (lama + 1.5) * 1000);
}

function jadwalkan() {
  if (!pengaturan.musik || !ctx || !lagu) return;
  const L = LAGU[lagu.indeks];
  const langkah = LANGKAH_DARI(L.tempo);
  // tab sempat tersembunyi: lompati not yang terlewat, jangan diputar sekaligus
  if (lagu.waktuBerikut < ctx.currentTime) lagu.waktuBerikut = ctx.currentTime + 0.05;
  while (lagu.waktuBerikut < ctx.currentTime + 0.15) {
    const i = lagu.langkah;
    // ganti tema di akhir frasa setelah ±75 detik
    if (i % L.melodi.length === 0 && i > 0 && lagu.waktuBerikut - lagu.mulai > LAMA_LAGU) {
      const lama = lagu;
      pudarkan(lama.gain, lama.waktuBerikut, 1.5);
      urutanLagu = (lama.indeks + 1) % LAGU.length;
      mulaiLagu(urutanLagu, lama.waktuBerikut + 0.4);
      return;
    }
    const akor = L.akor[Math.floor(i / 8) % L.akor.length];
    try {
      L.main(i, lagu.waktuBerikut, akor, L.melodi[i % L.melodi.length], lagu.gain);
    } catch {
      /* audio tidak tersedia */
    }
    lagu.waktuBerikut += langkah;
    lagu.langkah++;
  }
}

export function mulaiMusik() {
  if (penjadwal || !pengaturan.musik) return;
  const a = ac();
  if (!a) return;
  mulaiLagu(urutanLagu, a.currentTime + 0.1);
  penjadwal = setInterval(jadwalkan, 30);
}

/** Lompat ke lagu berikutnya (atau ke indeks tertentu). */
export function gantiLagu(indeks) {
  const a = ac();
  if (!a || !pengaturan.musik) return;
  urutanLagu = indeks ?? ((lagu ? lagu.indeks : urutanLagu) + 1) % LAGU.length;
  if (lagu) pudarkan(lagu.gain, a.currentTime, 0.5);
  mulaiLagu(urutanLagu, a.currentTime + 0.35);
  if (!penjadwal) penjadwal = setInterval(jadwalkan, 30);
}

export function hentikanMusik() {
  if (penjadwal) {
    clearInterval(penjadwal);
    penjadwal = null;
  }
  if (lagu && ctx) pudarkan(lagu.gain, ctx.currentTime, 0.4);
  lagu = null;
  kabarkanLagu();
}
