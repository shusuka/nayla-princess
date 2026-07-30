// Efek suara dibuat langsung dengan Web Audio API supaya tidak perlu file mp3.
// Suara Mimi memakai klip ElevenLabs (suara "Sarah") di /public/suara yang dibuat
// sekali lewat `npm run suara`; bila klip tidak ada, jatuh ke SpeechSynthesis.

import { ANGKA_SUARA, FRASA, FRASA_BY_TEKS, KATA_SUARA, idAngka } from "./suara-daftar";

let ctx = null;
let masterGain = null;
let musikGain = null;
let bicaraGain = null;
let musikTimer = null;
let musikStep = 0;

const pengaturan = { suara: true, musik: true, mimi: true };

export function setPengaturanAudio(p) {
  Object.assign(pengaturan, p);
  if (musikGain) musikGain.gain.value = pengaturan.musik ? 0.055 : 0;
  if (!pengaturan.musik) hentikanMusik();
  if (!pengaturan.mimi) hentikanBicara();
}

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
    musikGain = ctx.createGain();
    musikGain.gain.value = pengaturan.musik ? 0.055 : 0;
    musikGain.connect(masterGain);
    bicaraGain = ctx.createGain();
    bicaraGain.gain.value = 1;
    bicaraGain.connect(ctx.destination);
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

function nada({ freq, mulai = 0, durasi = 0.18, tipe = "sine", volume = 0.25, freqAkhir, tujuan }) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + mulai;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = tipe;
  osc.frequency.setValueAtTime(freq, t);
  if (freqAkhir) osc.frequency.exponentialRampToValueAtTime(freqAkhir, t + durasi);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  osc.connect(g);
  g.connect(tujuan || masterGain);
  osc.start(t);
  osc.stop(t + durasi + 0.05);
}

function derau({ mulai = 0, durasi = 0.2, volume = 0.2 }) {
  const a = ac();
  if (!a) return;
  const t = a.currentTime + mulai;
  const panjang = Math.floor(a.sampleRate * durasi);
  const buf = a.createBuffer(1, panjang, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < panjang; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / panjang);
  const src = a.createBufferSource();
  src.buffer = buf;
  const g = a.createGain();
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  src.connect(g);
  g.connect(masterGain);
  src.start(t);
}

const EFEK = {
  tap: () => nada({ freq: 620, durasi: 0.09, tipe: "triangle", volume: 0.18, freqAkhir: 880 }),
  pilih: () => nada({ freq: 480, durasi: 0.12, tipe: "square", volume: 0.12, freqAkhir: 720 }),
  benar: () => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      nada({ freq: f, mulai: i * 0.075, durasi: 0.24, tipe: "triangle", volume: 0.22 })
    );
  },
  salah: () => {
    nada({ freq: 330, durasi: 0.18, tipe: "sine", volume: 0.16, freqAkhir: 247 });
  },
  meong: () => {
    nada({ freq: 700, durasi: 0.16, tipe: "sawtooth", volume: 0.1, freqAkhir: 1050 });
    nada({ freq: 1000, mulai: 0.14, durasi: 0.3, tipe: "sawtooth", volume: 0.08, freqAkhir: 520 });
  },
  pop: () => {
    nada({ freq: 300, durasi: 0.08, tipe: "sine", volume: 0.3, freqAkhir: 1200 });
    derau({ durasi: 0.09, volume: 0.15 });
  },
  koin: () => {
    nada({ freq: 987.77, durasi: 0.1, tipe: "square", volume: 0.14 });
    nada({ freq: 1318.51, mulai: 0.08, durasi: 0.18, tipe: "square", volume: 0.12 });
  },
  bel: () => {
    nada({ freq: 1174.66, durasi: 0.5, tipe: "sine", volume: 0.16 });
    nada({ freq: 1567.98, durasi: 0.45, tipe: "sine", volume: 0.08 });
  },
  bintang: () => {
    [784, 988, 1175, 1568].forEach((f, i) =>
      nada({ freq: f, mulai: i * 0.09, durasi: 0.35, tipe: "sine", volume: 0.18 })
    );
  },
  levelSelesai: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      nada({ freq: f, mulai: i * 0.11, durasi: 0.4, tipe: "triangle", volume: 0.22 })
    );
    derau({ mulai: 0.5, durasi: 0.5, volume: 0.1 });
  },
  tepuk: () => {
    for (let i = 0; i < 7; i++) derau({ mulai: i * 0.085, durasi: 0.09, volume: 0.12 });
  },
  buka: () => {
    [392, 523, 659, 784, 1047].forEach((f, i) =>
      nada({ freq: f, mulai: i * 0.07, durasi: 0.3, tipe: "triangle", volume: 0.2 })
    );
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
    src.connect(bicaraGain);
    src.start(waktu, k.mulai, k.durasi);
    sumberAktif.push(src);
    waktu += k.durasi + 0.05;
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
    u.rate = 0.95;
    u.pitch = 1.5;
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
  if (!angka.every((n) => ADA_ANGKA.has(n))) {
    const teks =
      jenis === "kali" ? `${a} kali ${b} sama dengan ${jawab}` : `${a} dibagi ${b} sama dengan ${jawab}`;
    suaraCadangan(teks);
    return;
  }
  putarUrut([idAngka(a), kata, idAngka(b), KATA_SUARA.samaDengan.id, idAngka(jawab)]).then((ok) => {
    if (!ok) {
      const teks =
        jenis === "kali" ? `${a} kali ${b} sama dengan ${jawab}` : `${a} dibagi ${b} sama dengan ${jawab}`;
      suaraCadangan(teks);
    }
  });
}

// --------- Musik latar ceria (pentatonik, lembut) ---------
const MELODI = [
  523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33,
  523.25, 659.25, 783.99, 1046.5, 880.0, 783.99, 659.25, 523.25,
];
const BASS = [261.63, 0, 329.63, 0, 349.23, 0, 392.0, 0];

export function mulaiMusik() {
  if (musikTimer || !pengaturan.musik) return;
  const a = ac();
  if (!a) return;
  musikStep = 0;
  musikTimer = setInterval(() => {
    if (!pengaturan.musik) return;
    const f = MELODI[musikStep % MELODI.length];
    nada({ freq: f, durasi: 0.35, tipe: "triangle", volume: 0.5, tujuan: musikGain });
    const b = BASS[musikStep % BASS.length];
    if (b) nada({ freq: b, durasi: 0.5, tipe: "sine", volume: 0.6, tujuan: musikGain });
    musikStep++;
  }, 340);
}

export function hentikanMusik() {
  if (musikTimer) {
    clearInterval(musikTimer);
    musikTimer = null;
  }
}
