/**
 * Membuat klip suara Mimi memakai ElevenLabs (suara "Sarah").
 *
 *   ELEVENLABS_API_KEY=xxx node scripts/buat-suara.mjs        (atau: npm run suara)
 *   npm run suara -- --ulang        -> buat ulang semua klip
 *
 * Hasilnya disimpan di public/suara/*.mp3 dan ikut di-commit,
 * sehingga aplikasi tidak pernah memanggil API saat dipakai anak.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { daftarKlip } from "../lib/suara-daftar.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TUJUAN = path.join(ROOT, "public", "suara");
// Suara bawaan ElevenLabs. Ganti lewat ELEVENLABS_VOICE_ID bila ingin suara lain.
// Catatan: akun tier gratis hanya boleh memakai suara bawaan, bukan suara library.
const SUARA = process.env.ELEVENLABS_VOICE_ID || "cgSgspJ2msm6clMCkdW9"; // Jessica
// flash v2.5 + language_code "id" membuat pelafalan mengikuti bahasa Indonesia.
const MODEL = "eleven_flash_v2_5";
const BAHASA = "id";

function bacaEnv() {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  const berkas = path.join(ROOT, ".env.local");
  if (!fs.existsSync(berkas)) return null;
  const baris = fs.readFileSync(berkas, "utf8").split(/\r?\n/);
  for (const b of baris) {
    const m = b.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.+?)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "");
  }
  return null;
}

async function buat(kunci, teks, tujuan) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${SUARA}?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: { "xi-api-key": kunci, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: teks,
        model_id: MODEL,
        language_code: BAHASA,
        voice_settings: { stability: 0.5, similarity_boost: 0.8, speed: 0.95 },
      }),
    }
  );
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  fs.writeFileSync(tujuan, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const kunci = bacaEnv();
  if (!kunci) {
    console.error("ELEVENLABS_API_KEY belum diisi (pakai .env.local atau variabel lingkungan).");
    process.exit(1);
  }
  const ulang = process.argv.includes("--ulang");
  fs.mkdirSync(TUJUAN, { recursive: true });

  const klip = daftarKlip();
  const perlu = klip.filter((k) => ulang || !fs.existsSync(path.join(TUJUAN, `${k.id}.mp3`)));
  const huruf = perlu.reduce((n, k) => n + k.teks.length, 0);
  console.log(`${klip.length} klip, ${perlu.length} perlu dibuat (~${huruf} karakter).`);

  let gagal = 0;
  for (const [i, k] of perlu.entries()) {
    const tujuan = path.join(TUJUAN, `${k.id}.mp3`);
    try {
      await buat(kunci, k.teks, tujuan);
      console.log(`  [${i + 1}/${perlu.length}] ${k.id}  "${k.teks}"`);
    } catch (e) {
      gagal++;
      console.error(`  [${i + 1}/${perlu.length}] GAGAL ${k.id}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  console.log(gagal ? `Selesai dengan ${gagal} kegagalan.` : "Semua klip selesai dibuat.");
}

main();
