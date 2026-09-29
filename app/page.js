"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { Gelembung, Ikon, KartuMiring, Modal, PilKoin, SinarPutar, Tombol } from "@/components/UI";
import { PUJIAN } from "@/lib/data";
import { bicara, sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

const SAPAAN = [
  "Halo! Yuk belajar matematika!",
  "Aku Mimi. Ayo main bersama!",
  "Elus kepalaku dong, hehe",
  "Hari ini kita belajar apa?",
  "Kamu pasti bisa!",
];

const MENU = [
  {
    href: "/belajar",
    label: "Belajar",
    sub: "20 level seru",
    emoji: "📘",
    warna: "#3d6bff",
    bayangan: "#2445c9",
    besar: true,
  },
  { href: "/main", label: "Bermain", sub: "5 mini game", emoji: "🎮", warna: "#2fbf86", bayangan: "#1f9064" },
  { href: "/hadiah", label: "Hadiah", sub: "Butik Mimi", emoji: "🎁", warna: "#ff7eb6", bayangan: "#d44d8c", emas: true },
];

function Setelan({ nilai, onUbah, label, ikon }) {
  return (
    <button
      type="button"
      onClick={onUbah}
      className="flex w-full items-center justify-between rounded-[22px] bg-awan px-4 py-3 text-lg font-semibold text-tinta transition-transform active:scale-[0.98]"
      role="switch"
      aria-checked={nilai}
    >
      <span className="flex items-center gap-3">
        <span className="text-2xl">{ikon}</span>
        {label}
      </span>
      <span className={`relative h-9 w-16 rounded-full transition-colors duration-300 ${nilai ? "bg-mint" : "bg-slate-300"}`}>
        <span
          className="absolute top-1 h-7 w-7 rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]"
          style={{ transform: `translateX(${nilai ? 32 : 4}px)` }}
        />
      </span>
    </button>
  );
}

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
    setTimeout(() => setAksi("lambai"), 950);
  };

  const streak = state.stats.streak;

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 pb-44 pt-3">
      <Latar />

      {/* baris atas: pil kaca mengambang */}
      <div className="kaca anim-muncul flex w-full max-w-3xl items-center justify-between gap-2 rounded-full py-1.5 pl-2 pr-1.5">
        <div className="flex items-center gap-2">
          <PilKoin ikon="ikan" nilai={state.ikan} />
          <PilKoin ikon="permata" nilai={state.permata} />
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="pil-koin anim-bobbing">
              <Ikon nama="api" ukuran={24} />
              <span className="angka">{streak}</span>
              <span className="hidden text-sm font-semibold text-tinta-lembut sm:inline">hari</span>
            </span>
          )}
          <Tombol
            warna="#ffffff"
            bayangan="#c9dcf5"
            className="!text-tinta grid h-11 w-11 place-items-center !rounded-full"
            onClick={() => setBukaSetelan(true)}
            aria-label="Pengaturan"
          >
            <Ikon nama="gir" ukuran={22} />
          </Tombol>
        </div>
      </div>

      {/* judul */}
      <h1 className="anim-muncul mt-5 text-center text-5xl font-extrabold leading-[0.9] tracking-tight sm:text-7xl" style={{ animationDelay: ".08s" }}>
        <span className="judul-tebal block">CatMath</span>
        <span className="teks-emas block">Adventure</span>
      </h1>
      <p className="kaca anim-muncul mt-3 rounded-full px-4 py-1.5 text-sm font-semibold text-tinta sm:text-base" style={{ animationDelay: ".16s" }}>
        Perkalian &amp; Pembagian 1–10
      </p>

      {/* Mimi di atas panggung */}
      <section className="relative mt-3 flex flex-col items-center" aria-label="Mimi">
        <Gelembung className="mb-2">{sapaan}</Gelembung>
        <div className="relative grid place-items-center">
          <SinarPutar ukuran={360} warna="rgba(255,255,255,.55)" />
          {/* kilau yang mengorbit */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
              style={{ animation: `sinar-putar ${7 + i * 2}s linear ${-i * 2}s infinite` }}
            >
              <span className="absolute block" style={{ transform: `translate(${110 + i * 14}px, -10px)` }}>
                <span className="anim-kilau block text-xl">✨</span>
              </span>
            </span>
          ))}
          <button type="button" onClick={sentuhMimi} aria-label="Sentuh Mimi" className="relative z-10 bg-transparent">
            <Kucing id={state.kucingAktif} dipakai={state.dipakai} ekspresi="senang" aksi={aksi} ukuran={230} />
          </button>
          {/* panggung */}
          <div className="relative -mt-9 h-12 w-64 rounded-[50%] bingkai-emas !rounded-[50%]">
            <div
              className="polkadot h-full w-full rounded-[50%]"
              style={{ backgroundColor: "#ff9cc8", "--dot": "rgba(255,255,255,.45)", boxShadow: "inset 0 -8px 14px rgba(0,0,0,.12), inset 0 4px 0 rgba(255,255,255,.5)" }}
            />
          </div>
        </div>
      </section>

      {/* menu utama: bento asimetris */}
      <nav className="mt-7 grid w-full max-w-lg grid-cols-2 grid-rows-2 gap-4" aria-label="Menu utama">
        {MENU.map((m, i) => (
          <div key={m.href} className={`anim-muncul ${m.besar ? "row-span-2" : ""}`} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
            <KartuMiring kuat={12}>
              <Tombol
                href={m.href}
                warna={m.warna}
                bayangan={m.bayangan}
                className={`polkadot flex h-full w-full flex-col items-center justify-center gap-1 px-3 ${m.besar ? "min-h-[15rem] py-6 text-3xl" : "min-h-[7rem] py-4 text-2xl"}`}
                style={{ "--dot": "rgba(255,255,255,.16)" }}
              >
                {m.emas && <span className="foil" />}
                <span className={`anim-melayang inline-block drop-shadow-[0_8px_10px_rgba(0,0,0,.2)] ${m.besar ? "text-7xl" : "text-5xl"}`} style={{ animationDelay: `${-i}s` }}>
                  {m.emoji}
                </span>
                <span>{m.label}</span>
                <span className="text-sm font-semibold opacity-85">{m.sub}</span>
              </Tombol>
            </KartuMiring>
          </div>
        ))}
      </nav>

      <Link
        href="/ortu"
        onClick={() => sfx("tap")}
        className="kaca anim-muncul mt-6 rounded-full px-5 py-2 text-sm font-semibold text-tinta-lembut transition-transform hover:scale-105"
        style={{ animationDelay: ".55s" }}
      >
        👨‍👩‍👧 Ruang Orang Tua
      </Link>

      {/* modal nama */}
      <Modal terbuka={tanyaNama}>
        <div className="-mt-2 flex justify-center">
          <Kucing id="mimi" ekspresi="senang" aksi="lambai" ukuran={130} bisaDielus={false} />
        </div>
        <h2 className="mt-1 text-3xl font-bold text-tinta">Siapa namamu?</h2>
        <p className="mt-1 text-tinta-lembut">Supaya Mimi bisa memanggilmu.</p>
        <label htmlFor="nama-anak" className="sr-only">
          Nama kamu
        </label>
        <input
          id="nama-anak"
          value={isiNama}
          onChange={(e) => setIsiNama(e.target.value)}
          maxLength={14}
          placeholder="Nama kamu"
          className="mt-4 w-full rounded-[22px] border-4 border-langit bg-white px-4 py-3 text-center font-display text-2xl font-bold text-tinta outline-none transition-colors focus:border-laut"
        />
        <div className="mt-5 flex justify-center">
          <Tombol
            warna="#2fbf86"
            bayangan="#1f9064"
            className="px-8 py-3 text-xl"
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
        <h2 className="text-3xl font-bold text-tinta">Pengaturan</h2>
        <div className="mt-4 space-y-3">
          {[
            { k: "suara", label: "Efek suara", ikon: "🔔" },
            { k: "musik", label: "Musik latar", ikon: "🎵" },
            { k: "mimi", label: "Suara Mimi", ikon: "🐱" },
          ].map((s) => (
            <Setelan
              key={s.k}
              label={s.label}
              ikon={s.ikon}
              nilai={state.setelan[s.k]}
              onUbah={() => {
                nyalakanAudio();
                ubahSetelan({ [s.k]: !state.setelan[s.k] });
                sfx("pilih");
              }}
            />
          ))}
        </div>
      </Modal>
    </main>
  );
}
