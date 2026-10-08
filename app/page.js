"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import Obrolan, { useMimiBicara } from "@/components/Obrolan";
import {
  Gelembung,
  Ikon,
  KartuMiring,
  Modal,
  PemutarMusik,
  PilKoin,
  SinarPutar,
  Tombol,
  TombolLayarPenuh,
} from "@/components/UI";
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

/** Ukuran Mimi mengikuti tinggi layar supaya beranda muat satu layar tanpa digulir. */
function useUkuranMimi() {
  const [ukuran, setUkuran] = useState(200);
  useEffect(() => {
    const hitung = () => setUkuran(Math.round(Math.min(230, Math.max(110, (window.innerHeight - 570) * 0.8))));
    hitung();
    window.addEventListener("resize", hitung);
    return () => window.removeEventListener("resize", hitung);
  }, []);
  return ukuran;
}

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
  const { state, siap, nyalakanAudio, setNama, ubahSetelan, levelLanjut } = useGame();
  const [sapaan, setSapaan] = useState(SAPAAN[0]);
  const [aksi, setAksi] = useState("lambai");
  const [isiNama, setIsiNama] = useState("");
  const [bukaSetelan, setBukaSetelan] = useState(false);
  const [ngobrol, setNgobrol] = useState(false);
  const [suasana, setSuasana] = useState("senang");
  const bicaraMimi = useMimiBicara();
  const ukuranMimi = useUkuranMimi();

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
    <main className="relative flex h-dvh flex-col items-center overflow-hidden px-4 pb-[max(4.5rem,10vh)] pt-3">
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
          <TombolLayarPenuh />
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

      {/* judul satu baris */}
      <h1
        className="anim-muncul mt-3 whitespace-nowrap text-center text-[clamp(1.9rem,8.2vw,4.6rem)] font-extrabold leading-none tracking-tight"
        style={{ animationDelay: ".08s" }}
      >
        <span className="judul-tebal">CatMath</span> <span className="teks-emas">Adventure</span>
      </h1>
      <div className="anim-muncul mt-2 flex flex-wrap items-center justify-center gap-2" style={{ animationDelay: ".16s" }}>
        <p className="kaca rounded-full px-4 py-1.5 text-sm font-semibold text-tinta sm:text-base">Perkalian &amp; Pembagian 1–10</p>
        <PemutarMusik />
      </div>

      {/* Mimi di atas panggung */}
      <section className="relative mt-1 flex min-h-0 flex-1 flex-col items-center justify-center" aria-label="Mimi">
        <div className={`transition-opacity duration-300 ${ngobrol ? "opacity-0" : "opacity-100"}`}>
          <Gelembung className="mb-2">{sapaan}</Gelembung>
        </div>
        <div className="relative grid place-items-center">
          <SinarPutar ukuran={Math.round(ukuranMimi * 1.55)} warna="rgba(255,255,255,.55)" />
          {/* kilau yang mengorbit */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
              style={{ animation: `sinar-putar ${7 + i * 2}s linear ${-i * 2}s infinite` }}
            >
              <span className="absolute block" style={{ transform: `translate(${Math.round(ukuranMimi * 0.48) + i * 14}px, -10px)` }}>
                <span className="anim-kilau block text-xl">✨</span>
              </span>
            </span>
          ))}
          <button type="button" onClick={sentuhMimi} aria-label="Sentuh Mimi" className="relative z-10 bg-transparent">
            <Kucing
              id={state.kucingAktif}
              dipakai={state.dipakai}
              ekspresi={ngobrol ? suasana : "senang"}
              aksi={aksi}
              bicara={bicaraMimi}
              ukuran={ukuranMimi}
            />
          </button>
          {/* ajak Mimi mengobrol */}
          <button
            type="button"
            onClick={() => {
              nyalakanAudio();
              sfx("pilih");
              setNgobrol(true);
            }}
            className="tombol-ngobrol absolute -right-4 top-6 z-20 flex flex-col items-center gap-0.5 sm:-right-14"
            aria-label="Ngobrol dengan Mimi"
          >
            <span className="relative grid h-14 w-14 place-items-center rounded-full bg-mawar text-white shadow-[inset_0_-4px_0_rgb(0_0_0/.12),0_12px_22px_-10px_rgb(212_77_140/.9)]">
              <span className="absolute inset-0 rounded-full border-4 border-mawar/60" style={{ animation: "denyut-cincin 1.8s var(--ease-halus) infinite" }} />
              <Ikon nama="obrolan" ukuran={28} />
            </span>
            <span className="kaca rounded-full px-2.5 py-0.5 text-xs font-bold text-tinta">Ngobrol</span>
          </button>
          {/* panggung */}
          <div className="relative -mt-9 h-12 rounded-[50%] bingkai-emas !rounded-[50%]" style={{ width: Math.round(ukuranMimi * 1.1) }}>
            <div
              className="polkadot h-full w-full rounded-[50%]"
              style={{ backgroundColor: "#ff9cc8", "--dot": "rgba(255,255,255,.45)", boxShadow: "inset 0 -8px 14px rgba(0,0,0,.12), inset 0 4px 0 rgba(255,255,255,.5)" }}
            />
          </div>
        </div>
      </section>

      {/* tombol utama: langsung ke materi berikutnya */}
      <div className="anim-muncul mt-3 w-full max-w-2xl" style={{ animationDelay: ".18s" }}>
        <Tombol
          href={levelLanjut ? `/belajar/${levelLanjut.id}` : "/belajar/tantangan"}
          warna="#ff9b54"
          bayangan="#d9702a"
          className="polkadot flex w-full items-center justify-center gap-3 px-5 py-3 text-xl sm:text-2xl"
          style={{ "--dot": "rgba(255,255,255,.16)" }}
        >
          <span className="text-3xl" aria-hidden="true">▶️</span>
          <span className="flex flex-col items-start leading-tight">
            <span>Lanjut belajar</span>
            <span className="text-sm font-semibold opacity-90">
              {levelLanjut ? levelLanjut.nama : "🏆 Mode Tantangan"}
            </span>
          </span>
        </Tombol>
      </div>

      {/* menu pendamping: tiga kartu sejajar, sama besar */}
      <nav className="mt-3 grid w-full max-w-2xl grid-cols-3 gap-3 sm:gap-4" aria-label="Menu utama">
        {MENU.map((m, i) => (
          <div key={m.href} className="anim-muncul" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
            <KartuMiring kuat={12} className="h-full">
              <Tombol
                href={m.href}
                warna={m.warna}
                bayangan={m.bayangan}
                className="polkadot flex h-full min-h-[clamp(5.5rem,12vh,8rem)] w-full flex-col items-center justify-center gap-0.5 px-2 py-3 text-xl sm:text-2xl"
                style={{ "--dot": "rgba(255,255,255,.16)" }}
              >
                {m.emas && <span className="foil" />}
                <span className="anim-melayang inline-block text-4xl drop-shadow-[0_8px_10px_rgba(0,0,0,.2)] sm:text-5xl" style={{ animationDelay: `${-i}s` }}>
                  {m.emoji}
                </span>
                <span>{m.label}</span>
                <span className="text-xs font-semibold opacity-85 sm:text-sm">{m.sub}</span>
              </Tombol>
            </KartuMiring>
          </div>
        ))}
      </nav>

      <Link
        href="/ortu"
        onClick={() => sfx("tap")}
        className="kaca anim-muncul mt-3 rounded-full px-5 py-1.5 text-sm font-semibold text-tinta-lembut transition-transform hover:scale-105"
        style={{ animationDelay: ".55s" }}
      >
        👨‍👩‍👧 Ruang Orang Tua
      </Link>

      <Obrolan terbuka={ngobrol} onTutup={() => setNgobrol(false)} onSuasana={setSuasana} />

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
          {state.setelan.mimi && (
            <div className="flex items-center justify-between gap-2 rounded-[22px] bg-awan px-4 py-3 text-lg font-semibold text-tinta">
              <span>Jenis suara</span>
              <span className="flex rounded-full bg-white p-1" role="radiogroup" aria-label="Jenis suara Mimi">
                {[
                  { lama: false, label: "Baru" },
                  { lama: true, label: "Lama" },
                ].map((o) => {
                  const aktif = !!state.setelan.suaraLama === o.lama;
                  return (
                    <button
                      key={o.label}
                      type="button"
                      role="radio"
                      aria-checked={aktif}
                      onClick={() => {
                        nyalakanAudio();
                        ubahSetelan({ suaraLama: o.lama });
                        sfx("pilih");
                        setTimeout(() => bicara("Meong! Halo, aku Mimi!"), 150);
                      }}
                      className={`rounded-full px-4 py-1 text-base transition-colors ${aktif ? "bg-laut text-white" : "text-tinta-lembut"}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-[22px] bg-awan px-4 py-3 text-lg font-semibold text-tinta">
            <span>Lagu</span>
            <PemutarMusik />
          </div>
        </div>
      </Modal>
    </main>
  );
}
