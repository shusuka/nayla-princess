"use client";

import { useState } from "react";
import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { BarAtas, Gelembung, Konfeti, Tombol } from "@/components/UI";
import { BARANG, KUCING, SLOT_NAMA, STIKER } from "@/lib/data";
import { bicara, sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

const TAB = [
  { id: "aksesori", label: "Aksesori", emoji: "🎀" },
  { id: "kucing", label: "Kucing", emoji: "🐱" },
  { id: "stiker", label: "Stiker", emoji: "🏅" },
];

export default function Hadiah() {
  const { state, beliBarang, pakaiBarang, bukaKucing, pilihKucing } = useGame();
  const [tab, setTab] = useState("aksesori");
  const [konfeti, setKonfeti] = useState(false);
  const [pesan, setPesan] = useState("Ayo dandani Mimi!");

  const rayakan = (teks, ucapan) => {
    setPesan(teks);
    setKonfeti(true);
    sfx("buka");
    bicara(ucapan);
    setTimeout(() => setKonfeti(false), 2200);
  };

  const beli = (b) => {
    if (state.barangDimiliki.includes(b.id)) {
      pakaiBarang(b.id);
      sfx("pilih");
      setPesan(state.dipakai[b.slot] === b.id ? `${b.nama} dilepas` : `${b.nama} dipakai!`);
      return;
    }
    if (state.ikan < b.harga) {
      sfx("salah");
      setPesan(`Ikan belum cukup. Kurang ${b.harga - state.ikan} 🐟`);
      return;
    }
    beliBarang(b.id);
    rayakan(`Yeay, dapat ${b.nama}!`, "Yeay! Kamu dapat hadiah baru!");
  };

  const ambilKucing = (k) => {
    if (state.kucingTerbuka.includes(k.id)) {
      pilihKucing(k.id);
      sfx("meong");
      setPesan(`Halo, aku ${k.nama}!`);
      return;
    }
    if (state.ikan < k.harga) {
      sfx("salah");
      setPesan(`Ikan belum cukup. Kurang ${k.harga - state.ikan} 🐟`);
      return;
    }
    bukaKucing(k.id);
    rayakan(`Kucing baru: ${k.nama}!`, "Asyik! Ada teman kucing baru!");
  };

  return (
    <main className="relative min-h-dvh pb-16">
      <Latar rumput={false} />
      <Konfeti aktif={konfeti} />
      <BarAtas judul="Hadiah" />

      <div className="mx-auto max-w-3xl px-4">
        {/* pratinjau kucing */}
        <div className="flex items-end justify-center">
          <Kucing
            id={state.kucingAktif}
            dipakai={state.dipakai}
            ekspresi="senang"
            aksi="goyang"
            ukuran={170}
          />
          <Gelembung className="mb-8">{pesan}</Gelembung>
        </div>

        {/* tab */}
        <div className="mt-3 flex justify-center gap-2">
          {TAB.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                sfx("tap");
              }}
              className={`rounded-full px-4 py-2 text-lg font-bold shadow transition-transform hover:scale-105 ${
                tab === t.id ? "bg-laut text-white" : "bg-white/90 text-laut-tua"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* aksesori */}
        {tab === "aksesori" && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BARANG.map((b) => {
              const punya = state.barangDimiliki.includes(b.id);
              const dipakai = state.dipakai[b.slot] === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => beli(b)}
                  className={`kartu anim-muncul flex flex-col items-center gap-1 p-3 transition-transform hover:-translate-y-1 ${
                    dipakai ? "!border-mint ring-4 ring-mint/50" : ""
                  }`}
                >
                  <span className="text-4xl">{b.emoji}</span>
                  <span className="text-sm font-bold text-laut-tua">{b.nama}</span>
                  <span className="text-xs text-laut-tua/60">{SLOT_NAMA[b.slot]}</span>
                  <span
                    className={`mt-1 rounded-full px-3 py-1 text-sm font-bold text-white ${
                      dipakai ? "bg-mint" : punya ? "bg-langit" : "bg-laut"
                    }`}
                  >
                    {dipakai ? "Dipakai ✓" : punya ? "Pakai" : `🐟 ${b.harga}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* kucing */}
        {tab === "kucing" && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {KUCING.map((k) => {
              const punya = state.kucingTerbuka.includes(k.id);
              const aktif = state.kucingAktif === k.id;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => ambilKucing(k)}
                  className={`kartu anim-muncul flex flex-col items-center p-2 transition-transform hover:-translate-y-1 ${
                    aktif ? "!border-mint ring-4 ring-mint/50" : ""
                  }`}
                >
                  <div className={punya ? "" : "opacity-40 grayscale"}>
                    <Kucing id={k.id} ukuran={110} ekspresi={punya ? "senang" : "tidur"} />
                  </div>
                  <span className="text-lg font-bold text-laut-tua">{punya ? k.nama : "???"}</span>
                  <span className="px-1 text-center text-xs text-laut-tua/60">{k.sifat}</span>
                  <span
                    className={`mb-1 mt-1 rounded-full px-3 py-1 text-sm font-bold text-white ${
                      aktif ? "bg-mint" : punya ? "bg-langit" : "bg-laut"
                    }`}
                  >
                    {aktif ? "Dipilih ✓" : punya ? "Pilih" : `🐟 ${k.harga}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* stiker */}
        {tab === "stiker" && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {STIKER.map((s) => {
              const punya = state.stiker.includes(s.id);
              return (
                <div
                  key={s.id}
                  className={`kartu anim-muncul flex flex-col items-center gap-1 p-3 text-center ${
                    punya ? "" : "opacity-60 grayscale"
                  }`}
                >
                  <span className={`text-4xl ${punya ? "anim-bobbing" : ""}`}>{punya ? s.emoji : "🔒"}</span>
                  <span className="text-sm font-bold text-laut-tua">{s.nama}</span>
                  <span className="text-xs text-laut-tua/60">{s.desc}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Tombol href="/main" warna="#3fbd84" bayangan="#2b9264" className="px-6 py-4 text-lg">
            🎮 Cari ikan lagi
          </Tombol>
          <Tombol href="/belajar" warna="#4f8ef7" bayangan="#2f6ede" className="px-6 py-4 text-lg">
            📘 Belajar lagi
          </Tombol>
        </div>
      </div>
    </main>
  );
}
