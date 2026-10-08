/**
 * Membuat klip suara Mimi (suara anak perempuan) memakai ElevenLabs.
 *
 *   npm run suara                 -> buat klip yang belum ada
 *   npm run suara -- --ulang      -> buat ulang semua klip (memakai kuota)
 *   npm run suara -- --olah       -> hanya olah ulang dari rekaman mentah (tanpa kuota)
 *
 * Alur: ElevenLabs -> .suara-mentah/*.mp3 (mentah, tidak di-commit)
 *       -> ffmpeg menaikkan nada + formant supaya terdengar seperti anak perempuan
 *       -> public/suara-lama/*.mp3 (di-commit, dipakai bila setelan "Jenis suara: Lama").
 * Jadi aplikasi tidak pernah memanggil API saat dipakai anak.
 *
 * Catatan akun tier gratis: hanya suara *premade* yang boleh dipakai lewat API
 * (suara library seperti "Kak Ceria" dan Voice Design butuh paket berbayar).
 * Bila sudah berbayar, isi ELEVENLABS_VOICE_ID dan ANAK_NADA=1 supaya suara asli dipakai.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { daftarKlip, klipHitung } from "../lib/suara-daftar.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Klip ElevenLabs sekarang jadi pilihan "suara lama"; suara bawaan dibuat oleh buat-suara-edge.mjs.
const TUJUAN = path.join(ROOT, "public", "suara-lama");
const MENTAH = path.join(ROOT, ".suara-mentah");

function bacaEnv(nama) {
  if (process.env[nama]) return process.env[nama];
  const berkas = path.join(ROOT, ".env.local");
  if (!fs.existsSync(berkas)) return null;
  for (const b of fs.readFileSync(berkas, "utf8").split("\n")) {
    const i = b.indexOf("=");
    if (i > 0 && b.slice(0, i).trim() === nama) return b.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return null;
}

const SUARA = bacaEnv("ELEVENLABS_VOICE_ID") || "cgSgspJ2msm6clMCkdW9"; // Jessica (premade, "cute")
// multilingual v2 terdengar paling natural untuk bahasa Indonesia (1 kredit/huruf);
// flash v2.5 lebih hemat (0,5 kredit/huruf) tapi lebih datar. Ganti lewat ELEVENLABS_MODEL.
const MODEL = bacaEnv("ELEVENLABS_MODEL") || "eleven_multilingual_v2";
const BAHASA = "id";
// Faktor nada. Bawaan 1 = suara asli tanpa diolah (paling jernih). Menaikkan nada
// (misal 1.24 seperti versi pertama) membuat suara lebih "anak" tetapi terdengar seperti robot.
const NADA = Number(bacaEnv("ANAK_NADA") || 1);

async function buat(kunci, teks, tujuan, suara = SUARA) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${suara}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": kunci, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: teks,
        model_id: MODEL,
        // language_code hanya diterima model flash/turbo; multilingual v2 mengenali bahasanya sendiri
        ...(MODEL.includes("flash") || MODEL.includes("turbo") ? { language_code: BAHASA } : {}),
        // stabilitas lebih tinggi = intonasi rapi, tidak "melompat-lompat" antarklip
        voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true, speed: 0.95 },
      }),
    }
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  fs.writeFileSync(tujuan, Buffer.from(await res.arrayBuffer()));
}

// buang hening di awal & akhir klip
const POTONG =
  "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05," +
  "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse";

function olah(sumber, tujuan) {
  const filter =
    NADA === 1
      ? `${POTONG},highpass=f=80,loudnorm=I=-16:TP=-1.5`
      : `${POTONG},rubberband=pitch=${NADA}:formant=shifted:pitchq=quality,highpass=f=120,` +
        "equalizer=f=3500:t=q:w=1.2:g=2.5,loudnorm=I=-16:TP=-1.5";
  execFileSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", sumber, "-af", filter, "-ar", "44100", "-ac", "1", "-b:a", "96k", tujuan],
    { stdio: "inherit" }
  );
}

/**
 * --contoh: rekam satu kalimat dengan setiap suara perempuan premade di akun ini
 * ke .suara-contoh/, supaya bisa dibandingkan dulu sebelum merekam semua klip.
 */
async function buatContoh(kunci) {
  const folder = path.join(ROOT, ".suara-contoh");
  fs.mkdirSync(folder, { recursive: true });
  const res = await fetch("https://api.elevenlabs.io/v1/voices", { headers: { "xi-api-key": kunci } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const { voices } = await res.json();
  const pilihan = voices.filter((v) => v.category === "premade" && v.labels?.gender === "female");
  const teks = "Meong! Halo, aku Mimi! Tiga kali empat, sama dengan dua belas. Hebat sekali!";
  for (const v of pilihan) {
    const nama = `${v.name.split(" ")[0].toLowerCase()}-${v.voice_id}`;
    const mentah = path.join(folder, `${nama}.mentah.mp3`);
    await buat(kunci, teks, mentah, v.voice_id);
    olah(mentah, path.join(folder, `${nama}.mp3`));
    fs.rmSync(mentah);
    console.log(`  ${v.name} (${v.voice_id}) -> .suara-contoh/${nama}.mp3`);
  }
  console.log(`Dengarkan, lalu isi ELEVENLABS_VOICE_ID di .env.local dengan id suara yang paling cocok.`);
}

async function main() {
  const hanyaOlah = process.argv.includes("--olah");
  const ulang = process.argv.includes("--ulang");
  fs.mkdirSync(TUJUAN, { recursive: true });
  fs.mkdirSync(MENTAH, { recursive: true });
  // --hitung: ikut rekam 200 kalimat utuh fakta perkalian/pembagian (±8.600 huruf)
  const klip = process.argv.includes("--hitung") ? [...daftarKlip(), ...klipHitung()] : daftarKlip();

  if (!hanyaOlah) {
    const kunci = bacaEnv("ELEVENLABS_API_KEY");
    if (!kunci) {
      console.error("ELEVENLABS_API_KEY belum diisi (pakai .env.local atau variabel lingkungan).");
      process.exit(1);
    }
    if (process.argv.includes("--contoh")) {
      await buatContoh(kunci);
      return;
    }
    const perlu = klip.filter((k) => ulang || !fs.existsSync(path.join(MENTAH, `${k.id}.mp3`)));
    const huruf = perlu.reduce((n, k) => n + k.teks.length, 0);
    console.log(`${klip.length} klip, ${perlu.length} perlu direkam (~${huruf} karakter).`);
    let gagal = 0;
    for (const [i, k] of perlu.entries()) {
      try {
        await buat(kunci, k.teks, path.join(MENTAH, `${k.id}.mp3`));
        console.log(`  [${i + 1}/${perlu.length}] ${k.id}  "${k.teks}"`);
      } catch (e) {
        gagal++;
        console.error(`  [${i + 1}/${perlu.length}] GAGAL ${k.id}: ${e.message}`);
      }
      await new Promise((r) => setTimeout(r, 350));
    }
    if (gagal) console.log(`${gagal} klip gagal direkam.`);
  }

  let n = 0;
  for (const k of klip) {
    const sumber = path.join(MENTAH, `${k.id}.mp3`);
    if (!fs.existsSync(sumber)) continue;
    olah(sumber, path.join(TUJUAN, `${k.id}.mp3`));
    n++;
  }
  console.log(`${n} klip diolah (nada x${NADA}) ke ${path.relative(ROOT, TUJUAN)}.`);
}

main();
