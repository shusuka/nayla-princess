/**
 * Membuat klip suara Mimi versi baru memakai suara neural Microsoft (Edge TTS, gratis, tanpa API key).
 *
 *   npm run suara:edge             -> buat klip yang belum ada
 *   npm run suara:edge -- --ulang  -> buat ulang semua klip
 *
 * Butuh `edge-tts` (pip install edge-tts) dan `ffmpeg` di PATH.
 * Nada dinaikkan oleh mesin TTS-nya sendiri (bukan diolah ffmpeg), jadi tidak ada bunyi
 * "robot" seperti hasil rubberband pada klip versi lama di public/suara-lama.
 * Selain kata & angka, setiap fakta perkalian/pembagian 1–10 direkam sebagai kalimat utuh
 * supaya intonasinya alami, tidak disambung-sambung per kata.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { daftarKlip, klipHitung } from "../lib/suara-daftar.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TUJUAN = path.join(ROOT, "public", "suara");
const SEMENTARA = fs.mkdtempSync(path.join(os.tmpdir(), "suara-edge-"));

const SUARA = process.env.EDGE_VOICE || "id-ID-GadisNeural";
const NADA = process.env.EDGE_PITCH || "+18Hz";
const TEMPO = process.env.EDGE_RATE || "-4%";

// Hening di awal & akhir dibuang (edge-tts menambah ±0,8 detik), lalu volume diratakan.
const RANTAI =
  "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05," +
  "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse," +
  "highpass=f=80,loudnorm=I=-16:TP=-1.5";

function rekam(teks, tujuan) {
  const mentah = path.join(SEMENTARA, "mentah.mp3");
  execFileSync("edge-tts", ["--voice", SUARA, `--pitch=${NADA}`, `--rate=${TEMPO}`, "--text", teks, "--write-media", mentah], {
    stdio: "ignore",
  });
  execFileSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", mentah, "-af", RANTAI, "-ar", "24000", "-ac", "1", "-b:a", "48k", tujuan],
    { stdio: "inherit" }
  );
}

function main() {
  const ulang = process.argv.includes("--ulang");
  fs.mkdirSync(TUJUAN, { recursive: true });
  const klip = [...daftarKlip(), ...klipHitung()];
  const perlu = klip.filter((k) => ulang || !fs.existsSync(path.join(TUJUAN, `${k.id}.mp3`)));
  console.log(`${klip.length} klip, ${perlu.length} perlu direkam (suara ${SUARA}, nada ${NADA}).`);
  let gagal = 0;
  for (const [i, k] of perlu.entries()) {
    try {
      rekam(k.teks, path.join(TUJUAN, `${k.id}.mp3`));
      console.log(`  [${i + 1}/${perlu.length}] ${k.id}  "${k.teks}"`);
    } catch (e) {
      gagal++;
      console.error(`  [${i + 1}/${perlu.length}] GAGAL ${k.id}: ${e.message}`);
    }
  }
  fs.rmSync(SEMENTARA, { recursive: true, force: true });
  if (gagal) console.log(`${gagal} klip gagal direkam.`);
}

main();
