"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { BarAtas, Bintang, Gelembung, Konfeti, Modal, Tombol } from "@/components/UI";
import { GAME_BY_ID, PUJIAN, PUZZLE_GAMBAR, SEMANGAT } from "@/lib/data";
import { soalCampur } from "@/lib/quiz";
import { bicara, sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

function ambil(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* =============== Area jawaban per game =============== */

function AreaIkan({ pilihan, onPilih, salahDipilih, jawab, status }) {
  return (
    <div className="relative mt-4 h-56 w-full overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-[#9fdcff] to-[#3aa7e8] sm:h-64">
      <div className="absolute inset-x-0 bottom-0 h-10 bg-[#ffe9a8]/70" />
      {[[10, 14], [26, 62], [48, 30], [70, 74], [86, 22]].map(([x, y], i) => (
        <span
          key={i}
          className="absolute rounded-full border-2 border-white/70 bg-white/25"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: 10 + (i % 3) * 6,
            height: 10 + (i % 3) * 6,
            animation: `bobbing ${2.5 + i * 0.4}s ease-in-out ${i * 0.5}s infinite`,
          }}
        />
      ))}
      <div className="relative flex h-full items-center justify-around px-2">
        {pilihan.map((p, i) => {
          const salah = salahDipilih.includes(p);
          const betul = status === "betul" && p === jawab;
          return (
            <button
              key={p}
              type="button"
              disabled={salah || status === "betul"}
              onClick={() => onPilih(p)}
              className={`relative flex flex-col items-center transition-opacity ${salah ? "opacity-40" : ""}`}
              style={{ animation: `berenang ${2.2 + i * 0.5}s ease-in-out ${i * 0.3}s infinite` }}
            >
              <span className={`block text-6xl sm:text-7xl ${betul ? "anim-lompat" : ""}`}>🐠</span>
              <span className="-mt-3 rounded-full border-2 border-laut bg-white px-3 py-0.5 text-2xl font-bold text-laut-tua shadow sm:text-3xl">
                {p}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AreaMakan({ pilihan, onPilih, salahDipilih, jawab, status, kucingId, dipakai }) {
  return (
    <div className="mt-4 w-full rounded-3xl border-4 border-white bg-[#ffeccd] p-3">
      <div className="flex justify-center">
        <Kucing
          id={kucingId}
          dipakai={dipakai}
          ekspresi={status === "betul" ? "senang" : status === "salah" ? "sedih" : "diam"}
          aksi={status === "betul" ? "lompat" : "none"}
          ukuran={130}
        />
      </div>
      <div className="mt-2 flex justify-around">
        {pilihan.map((p) => {
          const salah = salahDipilih.includes(p);
          const betul = status === "betul" && p === jawab;
          return (
            <button
              key={p}
              type="button"
              disabled={salah || status === "betul"}
              onClick={() => onPilih(p)}
              className={`relative rounded-3xl bg-white/80 px-3 py-2 shadow transition-transform hover:scale-110 ${
                salah ? "opacity-40" : ""
              } ${betul ? "anim-pop" : "anim-bobbing"}`}
            >
              <span className="block text-5xl">🍖</span>
              <span className="block text-2xl font-bold text-laut-tua">{p}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AreaBalon({ pilihan, onPilih, salahDipilih, jawab, status }) {
  const WARNA = ["#ff9bc4", "#ffd86e", "#7ee8b2", "#b79cff"];
  return (
    <div className="relative mt-4 h-64 w-full overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-[#dff3ff] to-[#a8dcff]">
      <div className="flex h-full items-center justify-around px-2">
        {pilihan.map((p, i) => {
          const salah = salahDipilih.includes(p);
          const betul = status === "betul" && p === jawab;
          if (betul) {
            return (
              <span key={p} className="anim-pop text-6xl">
                ⭐✨
              </span>
            );
          }
          return (
            <button
              key={p}
              type="button"
              disabled={salah || status === "betul"}
              onClick={() => onPilih(p)}
              className={`relative transition-opacity ${salah ? "opacity-30" : ""}`}
              style={{ animation: `bobbing ${2 + i * 0.4}s ease-in-out ${i * 0.25}s infinite` }}
            >
              <svg width="86" height="118" viewBox="0 0 46 76" aria-hidden="true">
                <ellipse cx="23" cy="26" rx="20" ry="25" fill={WARNA[i % WARNA.length]} />
                <ellipse cx="16" cy="18" rx="6" ry="9" fill="#fff" opacity="0.45" />
                <path d="M23 51 L18 58 L28 58 Z" fill={WARNA[i % WARNA.length]} />
                <path d="M23 58 q 8 10 0 18" stroke="#fff" strokeWidth="2" fill="none" />
              </svg>
              <span className="absolute inset-x-0 top-8 text-center text-2xl font-bold text-white drop-shadow">
                {p}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AreaTikus({ pilihan, onPilih, salahDipilih, jawab, status, kecepatan, kucingId, dipakai }) {
  return (
    <div className="relative mt-4 h-64 w-full overflow-hidden rounded-3xl border-4 border-white bg-gradient-to-b from-[#e9ffe9] to-[#bff0d3]">
      <div className="absolute bottom-1 left-1 z-10">
        <Kucing
          id={kucingId}
          dipakai={dipakai}
          ekspresi={status === "betul" ? "senang" : "diam"}
          aksi={status === "betul" ? "lompat" : "none"}
          ukuran={90}
        />
      </div>
      {pilihan.map((p, i) => {
        const salah = salahDipilih.includes(p);
        const betul = status === "betul" && p === jawab;
        return (
          <button
            key={p}
            type="button"
            disabled={salah || status === "betul"}
            onClick={() => onPilih(p)}
            className={`absolute ${salah ? "opacity-30" : ""}`}
            style={{
              top: `${8 + i * 27}%`,
              animation: `lari-tikus ${kecepatan + i * 0.9}s linear ${-i * 1.3}s infinite`,
            }}
          >
            <span className="block text-5xl">🐭</span>
            <span className="mt-[-6px] block rounded-full bg-white px-2 text-xl font-bold text-laut-tua shadow">
              {p}
            </span>
            {betul && <span className="absolute -top-6 left-2 text-3xl anim-pop">✨</span>}
          </button>
        );
      })}
    </div>
  );
}

function AreaPuzzle({ pilihan, onPilih, salahDipilih, jawab, status, gambar, terbuka }) {
  return (
    <div className="mt-4 w-full">
      <div className="mx-auto grid h-52 w-52 grid-cols-3 grid-rows-3 overflow-hidden rounded-3xl border-4 border-white bg-white sm:h-64 sm:w-64">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="relative overflow-hidden">
            <div
              className="absolute grid place-items-center text-[11.5rem] leading-none sm:text-[14rem]"
              style={{
                width: "300%",
                height: "300%",
                left: `${-(i % 3) * 100}%`,
                top: `${-Math.floor(i / 3) * 100}%`,
              }}
            >
              {gambar.emoji}
            </div>
            {i >= terbuka && (
              <div className="absolute inset-0 grid place-items-center border border-white bg-langit text-xl text-white">
                ❔
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center font-semibold text-laut-tua">
        {terbuka >= 9 ? `Selesai: ${gambar.nama}! 🎉` : `Kepingan terbuka: ${terbuka}/9`}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {pilihan.map((p) => {
          const salah = salahDipilih.includes(p);
          const betul = status === "betul" && p === jawab;
          return (
            <Tombol
              key={p}
              onClick={() => onPilih(p)}
              disabled={salah || status === "betul"}
              warna={betul ? "#3fbd84" : salah ? "#c9d6e6" : "#4f8ef7"}
              bayangan={betul ? "#2b9264" : salah ? "#a9b8cd" : "#2f6ede"}
              suara="pilih"
              className={`py-5 text-3xl ${betul ? "jawaban-benar" : ""}`}
            >
              {p}
            </Tombol>
          );
        })}
      </div>
    </div>
  );
}

/* =============== Halaman game =============== */

const PILIHAN_JENIS = [
  { id: "kali", label: "Perkalian", emoji: "✖️", warna: "#4f8ef7", bayangan: "#2f6ede" },
  { id: "bagi", label: "Pembagian", emoji: "➗", warna: "#3fbd84", bayangan: "#2b9264" },
  { id: "campur", label: "Campur", emoji: "🎲", warna: "#a07bf5", bayangan: "#7a55d0" },
];

export default function GameMain({ game }) {
  const info = GAME_BY_ID[game];
  const { state, catatJawaban, nyalakanAudio } = useGame();

  const [fase, setFase] = useState("pilih");
  const [soalList, setSoalList] = useState([]);
  const [ke, setKe] = useState(0);
  const [benar, setBenar] = useState(0);
  const [status, setStatus] = useState("tanya");
  const [salahDipilih, setSalahDipilih] = useState([]);
  const [pesan, setPesan] = useState("");
  const [konfeti, setKonfeti] = useState(false);
  const [gambar, setGambar] = useState(PUZZLE_GAMBAR[0]);
  const benarRef = useRef(0);
  const sudahSalah = useRef(false);

  const jumlahSoal = game === "puzzle" ? 9 : 10;

  const mulai = useCallback(
    (jenis) => {
      nyalakanAudio();
      setSoalList(
        soalCampur({ jenis, jumlah: jumlahSoal, jumlahPilihan: game === "puzzle" ? 4 : 3 })
      );
      setKe(0);
      setBenar(0);
      benarRef.current = 0;
      sudahSalah.current = false;
      setSalahDipilih([]);
      setStatus("tanya");
      setPesan("Ayo mulai!");
      setGambar(ambil(PUZZLE_GAMBAR));
      setFase("main");
    },
    [game, jumlahSoal, nyalakanAudio]
  );

  const soal = soalList[ke];

  const lanjut = useCallback(
    (indeksSekarang) => {
      setSalahDipilih([]);
      sudahSalah.current = false;
      setStatus("tanya");
      setPesan("");
      const berikut = indeksSekarang + 1;
      if (berikut >= jumlahSoal) {
        setFase("selesai");
        sfx("levelSelesai");
        setKonfeti(true);
        setTimeout(() => setKonfeti(false), 2600);
      } else {
        setKe(berikut);
      }
    },
    [jumlahSoal]
  );

  const pilih = (nilai) => {
    if (!soal || status === "betul") return;
    nyalakanAudio();
    if (nilai === soal.jawab) {
      const pujian = ambil(PUJIAN);
      setStatus("betul");
      setPesan(pujian);
      sfx(game === "balon" ? "pop" : game === "ikan" ? "koin" : "benar");
      setTimeout(() => sfx("bintang"), 140);
      bicara(pujian);
      setKonfeti(true);
      setTimeout(() => setKonfeti(false), 1200);
      if (!sudahSalah.current) {
        benarRef.current += 1;
        setBenar(benarRef.current);
      }
      catatJawaban({ kunci: soal.kunci, benar: !sudahSalah.current, hadiahIkan: 2 });
      const idx = ke;
      setTimeout(() => lanjut(idx), 1300);
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

  if (!info) {
    return (
      <main className="relative min-h-dvh">
        <Latar />
        <BarAtas judul="Game tidak ada" kembali="/main" />
        <div className="mx-auto mt-10 max-w-md px-4">
          <Tombol href="/main" className="w-full px-6 py-4 text-lg">
            Kembali ke daftar game
          </Tombol>
        </div>
      </main>
    );
  }

  const areaProps = {
    pilihan: soal?.pilihan || [],
    onPilih: pilih,
    salahDipilih,
    jawab: soal?.jawab,
    status,
  };

  return (
    <main className="relative min-h-dvh pb-14">
      <Latar rumput={false} />
      <Konfeti aktif={konfeti} jumlah={fase === "selesai" ? 70 : 20} />
      <BarAtas judul={`${info.emoji} ${info.nama}`} kembali="/main" />

      <div className="mx-auto max-w-xl px-4">
        {/* ---------- pilih jenis soal ---------- */}
        {fase === "pilih" && (
          <div className="flex flex-col items-center">
            <div className="flex items-end">
              <Kucing id={state.kucingAktif} dipakai={state.dipakai} ekspresi="senang" aksi="lambai" ukuran={130} />
              <Gelembung className="mb-6">Mau soal apa?</Gelembung>
            </div>
            <div className="mt-2 grid w-full gap-3">
              {PILIHAN_JENIS.map((j) => (
                <Tombol
                  key={j.id}
                  onClick={() => mulai(j.id)}
                  warna={j.warna}
                  bayangan={j.bayangan}
                  className="px-6 py-5 text-2xl"
                >
                  {j.emoji} {j.label}
                </Tombol>
              ))}
            </div>
            <p className="mt-5 text-center text-laut-tua/80">{info.desc}</p>
          </div>
        )}

        {/* ---------- main ---------- */}
        {fase === "main" && soal && (
          <div className="flex flex-col items-center">
            <div className="flex w-full items-center gap-3">
              <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/70">
                <div
                  className="h-full rounded-full bg-mint transition-all duration-500"
                  style={{ width: `${(ke / jumlahSoal) * 100}%` }}
                />
              </div>
              <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-laut-tua">
                {ke + 1}/{jumlahSoal}
              </span>
              <span className="rounded-full bg-mint px-3 py-1 text-sm font-bold text-white">✅ {benar}</span>
            </div>

            <div className={`kartu mt-3 w-full px-4 py-5 text-center ${status === "salah" ? "anim-getar" : ""}`}>
              <div className="text-5xl font-bold text-laut-tua sm:text-6xl">
                {soal.teks} = <span className="text-langit">?</span>
              </div>
              {pesan && (
                <div className="mt-2 text-lg font-semibold text-laut">{pesan}</div>
              )}

              {game === "ikan" && <AreaIkan {...areaProps} />}
              {game === "makan" && (
                <AreaMakan {...areaProps} kucingId={state.kucingAktif} dipakai={state.dipakai} />
              )}
              {game === "balon" && <AreaBalon {...areaProps} />}
              {game === "tikus" && (
                <AreaTikus
                  {...areaProps}
                  kecepatan={Math.max(9 - benar * 0.5, 4)}
                  kucingId={state.kucingAktif}
                  dipakai={state.dipakai}
                />
              )}
              {game === "puzzle" && <AreaPuzzle {...areaProps} gambar={gambar} terbuka={benar} />}
            </div>
          </div>
        )}

        {/* ---------- selesai ---------- */}
        {fase === "selesai" && (
          <Modal terbuka lebar="max-w-lg">
            <div className="flex justify-center">
              <Kucing id={state.kucingAktif} dipakai={state.dipakai} ekspresi="senang" aksi="tepuk" ukuran={150} />
            </div>
            <h2 className="mt-2 text-3xl font-bold text-laut-tua">Hebat! 🎉</h2>
            <div className="mt-2">
              <Bintang jumlah={Math.round((benar / jumlahSoal) * 5)} ukuran={34} />
            </div>
            <p className="mt-3 text-xl font-semibold text-laut-tua">
              Benar {benar} dari {jumlahSoal}
            </p>
            {game === "puzzle" && benar >= 9 && (
              <p className="mt-1 text-lg">
                Gambar terbuka: <span className="text-3xl">{gambar.emoji}</span> {gambar.nama}
              </p>
            )}
            <div className="mt-6 grid gap-3">
              <Tombol onClick={() => setFase("pilih")} warna="#ffb067" bayangan="#cf7526" className="px-6 py-4 text-lg">
                🔄 Main Lagi
              </Tombol>
              <Tombol href="/main" warna="#3fbd84" bayangan="#2b9264" className="px-6 py-4 text-lg">
                🎮 Game Lain
              </Tombol>
              <Tombol href="/hadiah" warna="#a07bf5" bayangan="#7a55d0" className="px-6 py-4 text-lg">
                🎁 Tukar Hadiah
              </Tombol>
            </div>
          </Modal>
        )}
      </div>
    </main>
  );
}
