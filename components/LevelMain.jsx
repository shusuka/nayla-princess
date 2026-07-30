"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { BarAtas, Bintang, Gelembung, KelompokBenda, Konfeti, Modal, Tombol } from "@/components/UI";
import { LEVELS, LEVEL_BY_ID, PUJIAN, SEMANGAT } from "@/lib/data";
import { soalCampur, soalLevel } from "@/lib/quiz";
import { bicara, bicaraHitung, sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

const JUMLAH_SOAL = 10;
const JUMLAH_TANTANGAN = 15;

function ambil(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* -------- Bantuan visual: kelompok benda / mangkuk -------- */
function BantuanVisual({ soal }) {
  if (soal.jenis === "kali") {
    return (
      <div className="anim-muncul mt-3 rounded-3xl bg-awan/80 p-3">
        <p className="mb-2 text-center text-sm font-semibold text-laut-tua">
          {soal.a} kelompok, tiap kelompok isi {soal.b} ikan
        </p>
        <KelompokBenda kelompok={soal.a} isi={soal.b} emoji="🐟" />
      </div>
    );
  }
  return (
    <div className="anim-muncul mt-3 rounded-3xl bg-awan/80 p-3">
      <p className="mb-2 text-center text-sm font-semibold text-laut-tua">
        {soal.a} ikan dibagi rata ke {soal.b} mangkuk
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: soal.b }, (_, i) => (
          <div
            key={i}
            className="anim-pop rounded-b-3xl rounded-t-lg border-4 border-oranye bg-white/80 px-2 pb-2 pt-1"
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <div className="grid grid-cols-5 gap-0.5">
              {Array.from({ length: soal.jawab }, (_, j) => (
                <span key={j} className="text-base sm:text-xl">
                  🐟
                </span>
              ))}
            </div>
            <div className="mt-1 text-center text-xs font-bold text-oranye">mangkuk {i + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------- Tabel belajar -------- */
function TabelBelajar({ level, onPilih, barisAktif }) {
  const baris = Array.from({ length: 10 }, (_, i) => i + 1);
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-2">
      {baris.map((k) => {
        const kali = level.jenis === "kali";
        const teks = kali ? `${level.angka} × ${k}` : `${level.angka * k} ÷ ${level.angka}`;
        const hasil = kali ? level.angka * k : k;
        const aktif = barisAktif === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onPilih(k)}
            className={`flex items-center justify-between rounded-2xl border-4 px-4 py-3 text-lg font-bold transition-transform ${
              aktif
                ? "scale-105 border-kuning bg-kuning/40 text-laut-tua"
                : "border-white bg-white/85 text-laut-tua hover:scale-105"
            }`}
          >
            <span>{teks}</span>
            <span className="text-laut">= {hasil}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function LevelMain({ id }) {
  const router = useRouter();
  const { state, catatJawaban, selesaiLevel, nyalakanAudio } = useGame();

  const tantangan = id === "tantangan";
  const level = LEVEL_BY_ID[id];

  const [fase, setFase] = useState(tantangan ? "siap" : "belajar");
  const [soalList, setSoalList] = useState([]);
  const [ke, setKe] = useState(0);
  const [benar, setBenar] = useState(0);
  const [salahDipilih, setSalahDipilih] = useState([]);
  const [status, setStatus] = useState("tanya"); // tanya | betul | salah
  const [pesan, setPesan] = useState("");
  const [bantuan, setBantuan] = useState(false);
  const [konfeti, setKonfeti] = useState(false);
  const [barisAktif, setBarisAktif] = useState(null);
  const [hasil, setHasil] = useState(null);
  const sudahSalah = useRef(false);
  const benarRef = useRef(0);

  const totalSoal = tantangan ? JUMLAH_TANTANGAN : JUMLAH_SOAL;

  const mulaiLatihan = useCallback(() => {
    nyalakanAudio();
    const daftar = tantangan
      ? soalCampur({ jumlah: JUMLAH_TANTANGAN, jumlahPilihan: 4 })
      : soalLevel({ jenis: level.jenis, angka: level.angka, jumlah: JUMLAH_SOAL, jumlahPilihan: 3 });
    setSoalList(daftar);
    setKe(0);
    setBenar(0);
    benarRef.current = 0;
    setHasil(null);
    setStatus("tanya");
    setSalahDipilih([]);
    setBantuan(false);
    sudahSalah.current = false;
    setFase("latihan");
    setPesan("Ayo kita coba!");
  }, [level, tantangan, nyalakanAudio]);

  const soal = soalList[ke];

  const bacaBaris = (k) => {
    nyalakanAudio();
    setBarisAktif(k);
    sfx("pilih");
    if (level.jenis === "kali") {
      bicaraHitung({ jenis: "kali", a: level.angka, b: k, jawab: level.angka * k });
    } else {
      bicaraHitung({ jenis: "bagi", a: level.angka * k, b: level.angka, jawab: k });
    }
  };

  const jawab = (nilai) => {
    if (!soal || status === "betul") return;
    nyalakanAudio();
    if (nilai === soal.jawab) {
      const pujian = ambil(PUJIAN);
      setStatus("betul");
      setPesan(pujian);
      sfx("benar");
      bicara(pujian);
      setKonfeti(true);
      setTimeout(() => setKonfeti(false), 1600);
      if (!sudahSalah.current) {
        benarRef.current += 1;
        setBenar(benarRef.current);
      }
      catatJawaban({ kunci: soal.kunci, benar: !sudahSalah.current, hadiahIkan: sudahSalah.current ? 1 : 2 });
      setTimeout(lanjut, 1400);
    } else {
      const kata = ambil(SEMANGAT);
      setStatus("salah");
      setPesan(kata);
      sfx("salah");
      bicara(kata);
      setSalahDipilih((s) => [...s, nilai]);
      if (!sudahSalah.current) {
        sudahSalah.current = true;
        catatJawaban({ kunci: soal.kunci, benar: false });
      }
      setTimeout(() => setStatus("tanya"), 900);
    }
  };

  const lanjut = () => {
    setSalahDipilih([]);
    setBantuan(false);
    sudahSalah.current = false;
    setStatus("tanya");
    setPesan("");
    const berikut = ke + 1;
    if (berikut >= soalList.length) selesai();
    else setKe(berikut);
  };

  const selesai = () => {
    const jumlahBenar = benarRef.current;
    const bintang = tantangan ? 0 : selesaiLevel(id, jumlahBenar, totalSoal);
    const bintangTampil = tantangan ? Math.round((jumlahBenar / totalSoal) * 5) : bintang;
    setHasil({ bintang: bintangTampil, benar: jumlahBenar });
    setFase("selesai");
    sfx("levelSelesai");
    setKonfeti(true);
    bicara(jumlahBenar >= totalSoal * 0.8 ? "Hebat sekali! Kamu berhasil!" : "Bagus! Terus berlatih ya.");
    setTimeout(() => setKonfeti(false), 2600);
  };

  const levelBerikut = useMemo(() => {
    if (tantangan) return null;
    const i = LEVELS.findIndex((l) => l.id === id);
    return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
  }, [id, tantangan]);

  if (!tantangan && !level) {
    return (
      <main className="relative min-h-dvh">
        <Latar />
        <BarAtas judul="Level tidak ada" kembali="/belajar" />
        <div className="mx-auto mt-10 max-w-md px-4">
          <Tombol href="/belajar" className="w-full px-6 py-4 text-lg">
            Kembali ke daftar level
          </Tombol>
        </div>
      </main>
    );
  }

  const judul = tantangan ? "🏆 Mode Tantangan" : level.nama;

  return (
    <main className="relative min-h-dvh pb-12">
      <Latar rumput={false} />
      <Konfeti aktif={konfeti} jumlah={fase === "selesai" ? 70 : 24} />
      <BarAtas judul={judul} kembali="/belajar" />

      <div className="mx-auto max-w-2xl px-4">
        {/* ---------- FASE SIAP (mode tantangan) ---------- */}
        {fase === "siap" && (
          <div className="flex flex-col items-center">
            <div className="flex items-end">
              <Kucing id={state.kucingAktif} dipakai={state.dipakai} ekspresi="senang" aksi="lambai" ukuran={140} />
              <Gelembung className="mb-6">Siap? {JUMLAH_TANTANGAN} soal campur!</Gelembung>
            </div>
            <div className="kartu mt-3 w-full p-5 text-center text-lg text-laut-tua">
              Soal perkalian <b>dan</b> pembagian 1–10 diacak. Pilih dari 4 jawaban. Kamu pasti bisa! 💪
            </div>
            <Tombol
              onClick={mulaiLatihan}
              warna="#a07bf5"
              bayangan="#7a55d0"
              className="mt-6 w-full px-6 py-5 text-2xl"
            >
              🏆 Mulai Tantangan
            </Tombol>
          </div>
        )}

        {/* ---------- FASE BELAJAR ---------- */}
        {fase === "belajar" && (
          <div className="flex flex-col items-center">
            <div className="flex items-end">
              <Kucing id={state.kucingAktif} dipakai={state.dipakai} ekspresi="senang" ukuran={110} />
              <Gelembung className="mb-5">Sentuh setiap baris, Mimi bacakan!</Gelembung>
            </div>

            <div className="kartu mt-3 w-full p-4">
              <TabelBelajar level={level} onPilih={bacaBaris} barisAktif={barisAktif} />
              {barisAktif && (
                <div className="mt-4">
                  <BantuanVisual
                    soal={
                      level.jenis === "kali"
                        ? { jenis: "kali", a: level.angka, b: barisAktif, jawab: level.angka * barisAktif }
                        : { jenis: "bagi", a: level.angka * barisAktif, b: level.angka, jawab: barisAktif }
                    }
                  />
                </div>
              )}
            </div>

            <Tombol
              onClick={mulaiLatihan}
              warna="#3fbd84"
              bayangan="#2b9264"
              className="mt-6 w-full px-6 py-5 text-2xl"
            >
              ▶️ Yuk Latihan!
            </Tombol>
          </div>
        )}

        {/* ---------- FASE LATIHAN ---------- */}
        {fase === "latihan" && soal && (
          <div className="flex flex-col items-center">
            {/* progres */}
            <div className="mt-1 flex w-full items-center gap-3">
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-mint transition-all duration-500"
                  style={{ width: `${(ke / soalList.length) * 100}%` }}
                />
              </div>
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-laut-tua">
                {ke + 1}/{soalList.length}
              </span>
              <span className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-white">✅ {benar}</span>
            </div>

            <div className="mt-3 flex items-end">
              <Kucing
                id={state.kucingAktif}
                dipakai={state.dipakai}
                ekspresi={status === "betul" ? "senang" : status === "salah" ? "sedih" : "diam"}
                aksi={status === "betul" ? "lompat" : "none"}
                ukuran={100}
              />
              {pesan && <Gelembung className="mb-4">{pesan}</Gelembung>}
            </div>

            {/* soal */}
            <div
              className={`kartu mt-2 w-full px-6 py-8 text-center ${status === "salah" ? "anim-getar" : ""}`}
            >
              <div className="text-5xl font-bold text-laut-tua sm:text-6xl">
                {soal.teks} = <span className="text-langit">?</span>
              </div>

              <div className={`mt-6 grid gap-3 ${soal.pilihan.length > 3 ? "grid-cols-2" : "grid-cols-3"}`}>
                {soal.pilihan.map((p) => {
                  const salah = salahDipilih.includes(p);
                  const betul = status === "betul" && p === soal.jawab;
                  return (
                    <Tombol
                      key={p}
                      onClick={() => jawab(p)}
                      disabled={salah || status === "betul"}
                      warna={betul ? "#3fbd84" : salah ? "#c9d6e6" : "#4f8ef7"}
                      bayangan={betul ? "#2b9264" : salah ? "#a9b8cd" : "#2f6ede"}
                      suara="pilih"
                      className={`py-6 text-4xl ${betul ? "jawaban-benar anim-pop" : ""}`}
                    >
                      {p}
                    </Tombol>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setBantuan((b) => !b);
                  sfx("pilih");
                }}
                className="mt-5 rounded-full bg-kuning px-5 py-2 text-lg font-bold text-laut-tua shadow"
              >
                💡 {bantuan ? "Sembunyikan bantuan" : "Bantu aku!"}
              </button>

              {bantuan && <BantuanVisual soal={soal} />}
            </div>
          </div>
        )}

        {/* ---------- FASE SELESAI ---------- */}
        {fase === "selesai" && hasil && (
          <Modal terbuka lebar="max-w-lg">
            <div className="flex justify-center">
              <Kucing
                id={state.kucingAktif}
                dipakai={state.dipakai}
                ekspresi="senang"
                aksi="tepuk"
                ukuran={150}
              />
            </div>
            <h2 className="mt-2 text-3xl font-bold text-laut-tua">Selesai! 🎉</h2>
            <div className="mt-2">
              <Bintang jumlah={hasil.bintang} ukuran={36} />
            </div>
            <p className="mt-3 text-xl font-semibold text-laut-tua">
              Benar {hasil.benar} dari {totalSoal}
            </p>
            <p className="mt-1 text-laut-tua/70">
              Kamu dapat 🐟 {hasil.bintang * 3 + hasil.benar * 2} ikan
              {!tantangan && hasil.bintang > 0 ? ` dan 💎 ${hasil.bintang >= 5 ? 3 : hasil.bintang >= 3 ? 2 : 1} permata` : ""}
            </p>

            <div className="mt-6 grid gap-3">
              <Tombol onClick={mulaiLatihan} warna="#ffb067" bayangan="#cf7526" className="px-6 py-4 text-lg">
                🔄 Ulangi
              </Tombol>
              {levelBerikut && hasil.bintang > 0 && (
                <Tombol
                  onClick={() => router.push(`/belajar/${levelBerikut.id}`)}
                  warna="#3fbd84"
                  bayangan="#2b9264"
                  className="px-6 py-4 text-lg"
                >
                  ➡️ Lanjut: {levelBerikut.nama}
                </Tombol>
              )}
              <Tombol href="/main" warna="#a07bf5" bayangan="#7a55d0" className="px-6 py-4 text-lg">
                🎮 Main Game
              </Tombol>
              <Tombol href="/belajar" warna="#4f8ef7" bayangan="#2f6ede" className="px-6 py-4 text-lg">
                📘 Pilih Level Lain
              </Tombol>
            </div>
          </Modal>
        )}
      </div>
    </main>
  );
}
