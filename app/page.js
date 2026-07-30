"use client";

import { useEffect, useState } from "react";
import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { Gelembung, Modal, Tombol } from "@/components/UI";
import { PUJIAN } from "@/lib/data";
import { bicara, sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

const SAPAAN = [
  "Halo! Yuk belajar matematika!",
  "Aku Mimi. Ayo main bersama!",
  "Hari ini kita belajar apa?",
  "Kamu pasti bisa!",
];

const MENU = [
  { href: "/belajar", label: "Belajar", emoji: "📘", warna: "#4f8ef7", bayangan: "#2f6ede" },
  { href: "/main", label: "Bermain", emoji: "🎮", warna: "#3fbd84", bayangan: "#2b9264" },
  { href: "/hadiah", label: "Hadiah", emoji: "🎁", warna: "#a07bf5", bayangan: "#7a55d0" },
  { href: "/ortu", label: "Orang Tua", emoji: "👨‍👩‍👧", warna: "#f79a4a", bayangan: "#cf7526" },
];

export default function Beranda() {
  const { state, siap, nyalakanAudio, setNama, ubahSetelan } = useGame();
  const [sapaan, setSapaan] = useState(SAPAAN[0]);
  const [aksi, setAksi] = useState("lambai");
  const [isiNama, setIsiNama] = useState("");
  const [bukaSetelan, setBukaSetelan] = useState(false);

  // Nama kosong = anak baru pertama kali membuka aplikasi.
  const tanyaNama = siap && !state.namaAnak;

  useEffect(() => {
    const t = setInterval(() => {
      setSapaan(SAPAAN[Math.floor(Math.random() * SAPAAN.length)]);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  const sentuhMimi = () => {
    nyalakanAudio();
    sfx("meong");
    const kata = PUJIAN[Math.floor(Math.random() * PUJIAN.length)];
    setSapaan(state.namaAnak ? `Halo ${state.namaAnak}! ${kata}` : kata);
    bicara("Meong! Halo, aku Mimi!");
    setAksi("lompat");
    setTimeout(() => setAksi("lambai"), 900);
  };

  const streak = state.stats.streak;

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 pb-10 pt-4">
      <Latar />

      {/* baris atas */}
      <div className="flex w-full max-w-3xl items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 font-semibold text-laut-tua shadow">
            🐟 {state.ikan}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 font-semibold text-laut-tua shadow">
            💎 {state.permata}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="anim-bobbing flex items-center gap-1 rounded-full bg-oranye px-3 py-1.5 font-semibold text-white shadow">
              🔥 {streak} hari
            </span>
          )}
          <Tombol
            warna="#ffffff"
            bayangan="#bcd9f5"
            className="!text-laut-tua px-3 py-1.5 text-lg"
            onClick={() => setBukaSetelan(true)}
            aria-label="Pengaturan"
          >
            ⚙️
          </Tombol>
        </div>
      </div>

      {/* judul */}
      <h1 className="judul-tebal mt-3 text-center text-4xl font-bold sm:text-6xl">
        CatMath <span className="anim-pelangi inline-block">Adventure</span>
      </h1>
      <p className="mt-1 rounded-full bg-white/70 px-4 py-1 text-sm font-semibold text-laut-tua sm:text-base">
        Perkalian &amp; Pembagian 1–10
      </p>

      {/* Mimi */}
      <div className="mt-4 flex flex-col items-center">
        <Gelembung className="anim-muncul mb-4">{sapaan}</Gelembung>
        <button type="button" onClick={sentuhMimi} aria-label="Sentuh Mimi" className="bg-transparent">
          <Kucing
            id={state.kucingAktif}
            dipakai={state.dipakai}
            ekspresi="senang"
            aksi={aksi}
            ukuran={220}
          />
        </button>
      </div>

      {/* menu utama */}
      <div className="mt-6 grid w-full max-w-md grid-cols-2 gap-4">
        {MENU.map((m, i) => (
          <Tombol
            key={m.href}
            href={m.href}
            warna={m.warna}
            bayangan={m.bayangan}
            className="anim-muncul flex flex-col items-center gap-1 px-4 py-5 text-xl sm:text-2xl"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="text-4xl sm:text-5xl">{m.emoji}</span>
            {m.label}
          </Tombol>
        ))}
      </div>

      {/* modal nama */}
      <Modal terbuka={tanyaNama}>
        <div className="text-5xl">🐱</div>
        <h2 className="mt-2 text-2xl font-bold text-laut-tua">Siapa namamu?</h2>
        <p className="mt-1 text-laut-tua/70">Supaya Mimi bisa memanggilmu.</p>
        <input
          value={isiNama}
          onChange={(e) => setIsiNama(e.target.value)}
          maxLength={14}
          placeholder="Nama kamu"
          className="mt-4 w-full rounded-2xl border-4 border-langit bg-white px-4 py-3 text-center text-xl font-semibold text-laut-tua outline-none focus:border-laut"
        />
        <div className="mt-4 flex justify-center gap-3">
          <Tombol
            warna="#7ee8b2"
            bayangan="#3fbd84"
            className="px-6 py-3 text-lg"
            onClick={() => {
              const n = isiNama.trim();
              setNama(n || "Teman");
              sfx("bel");
            }}
          >
            Mulai! 🎉
          </Tombol>
        </div>
      </Modal>

      {/* modal setelan */}
      <Modal terbuka={bukaSetelan} onTutup={() => setBukaSetelan(false)}>
        <h2 className="text-2xl font-bold text-laut-tua">Pengaturan</h2>
        <div className="mt-4 space-y-3">
          {[
            { k: "suara", label: "Efek suara", emoji: "🔔" },
            { k: "musik", label: "Musik latar", emoji: "🎵" },
            { k: "mimi", label: "Suara Mimi", emoji: "🐱" },
          ].map((s) => (
            <button
              key={s.k}
              type="button"
              onClick={() => {
                nyalakanAudio();
                ubahSetelan({ [s.k]: !state.setelan[s.k] });
                sfx("pilih");
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-awan px-4 py-3 text-lg font-semibold text-laut-tua"
            >
              <span>
                {s.emoji} {s.label}
              </span>
              <span
                className={`rounded-full px-4 py-1 text-white ${state.setelan[s.k] ? "bg-mint" : "bg-slate-400"}`}
              >
                {state.setelan[s.k] ? "Nyala" : "Mati"}
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </main>
  );
}
