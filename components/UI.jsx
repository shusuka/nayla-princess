"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useGame } from "@/lib/store";
import { sfx } from "@/lib/sound";

/* ---------------- Tombol besar 3D ---------------- */
export function Tombol({
  children,
  warna = "#4f8ef7",
  bayangan = "#2f6ede",
  className = "",
  onClick,
  href,
  disabled,
  suara = "tap",
  ...sisa
}) {
  const router = useRouter();
  const { nyalakanAudio } = useGame();

  const tekan = (e) => {
    nyalakanAudio();
    sfx(suara);
    if (onClick) onClick(e);
    if (href) {
      e.preventDefault();
      setTimeout(() => router.push(href), 90);
    }
  };

  return (
    <button
      type="button"
      onClick={tekan}
      disabled={disabled}
      className={`tombol-3d ${className}`}
      style={{ background: warna, "--bayangan": bayangan }}
      {...sisa}
    >
      {children}
    </button>
  );
}

/* ---------------- Bintang ---------------- */
export function Bintang({ jumlah = 0, dari = 5, ukuran = 22 }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${jumlah} dari ${dari} bintang`}>
      {Array.from({ length: dari }, (_, i) => (
        <span
          key={i}
          style={{ fontSize: ukuran, lineHeight: 1, filter: i < jumlah ? "none" : "grayscale(1)", opacity: i < jumlah ? 1 : 0.35 }}
        >
          ⭐
        </span>
      ))}
    </span>
  );
}

/* ---------------- Bar atas: kembali + koin ---------------- */
export function BarAtas({ judul, kembali = "/" }) {
  const { state } = useGame();
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5">
      <Tombol
        href={kembali}
        warna="#ffffff"
        bayangan="#bcd9f5"
        className="!text-laut-tua px-4 py-2 text-lg sm:text-xl"
        aria-label="Kembali"
      >
        ⬅️
      </Tombol>
      {judul && (
        <h1 className="judul-tebal min-w-0 flex-1 truncate px-1 text-center text-base font-semibold sm:text-2xl">
          {judul}
        </h1>
      )}
      <div className="flex shrink-0 items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-base font-semibold text-laut-tua shadow sm:text-lg">
          🐟 {state.ikan}
        </span>
        <span className="hidden items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-base font-semibold text-laut-tua shadow sm:flex sm:text-lg">
          💎 {state.permata}
        </span>
      </div>
    </div>
  );
}

/* ---------------- Gelembung bicara Mimi ---------------- */
export function Gelembung({ children, className = "" }) {
  return (
    <div className={`relative max-w-xs rounded-3xl border-4 border-white bg-white/95 px-5 py-3 text-center text-lg font-semibold text-laut-tua shadow-lg sm:text-xl ${className}`}>
      {children}
      <span className="absolute -bottom-3 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[14px] border-x-transparent border-t-white" />
    </div>
  );
}

/* ---------------- Konfeti ---------------- */
const WARNA_KONFETI = ["#ffd86e", "#7ee8b2", "#ff9bc4", "#b79cff", "#4f8ef7", "#ffb067"];

// Sebaran semu yang tetap: tampak acak tapi hasilnya sama setiap render.
function sebaran(i, geser = 0) {
  const x = Math.sin((i + 1) * 12.9898 + geser * 7.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Konfeti({ aktif, jumlah = 40 }) {
  // Dihitung saat aktif berubah; pemanggil yang mematikan `aktif` setelah animasi selesai.
  const potongan = useMemo(
    () =>
      aktif
        ? Array.from({ length: jumlah }, (_, i) => ({
            id: i,
            kiri: sebaran(i, 1) * 100,
            tunda: sebaran(i, 2) * 0.35,
            durasi: 1.5 + sebaran(i, 3) * 1.2,
            warna: WARNA_KONFETI[i % WARNA_KONFETI.length],
            putar: sebaran(i, 4) * 360,
            bentuk: i % 3,
          }))
        : [],
    [aktif, jumlah]
  );

  if (!potongan.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {potongan.map((p) => (
        <span
          key={p.id}
          className="absolute top-[-20px] block"
          style={{
            left: `${p.kiri}%`,
            width: p.bentuk === 2 ? 8 : 11,
            height: p.bentuk === 1 ? 16 : 11,
            background: p.warna,
            borderRadius: p.bentuk === 0 ? "50%" : 3,
            transform: `rotate(${p.putar}deg)`,
            animation: `jatuh-konfeti ${p.durasi}s ease-in ${p.tunda}s forwards`,
          }}
        />
      ))}
      <style>{`@keyframes jatuh-konfeti {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(105vh) rotate(720deg); opacity: 0.9; }
      }`}</style>
    </div>
  );
}

/* ---------------- Angka melayang (+1 ikan) ---------------- */
export function Melayang({ teks, kunci }) {
  if (!teks) return null;
  return (
    <span
      key={kunci}
      className="pointer-events-none absolute left-1/2 top-1/3 z-40 -translate-x-1/2 text-3xl font-bold text-white drop-shadow"
      style={{ animation: "naik-hilang 1.1s ease-out forwards" }}
    >
      {teks}
    </span>
  );
}

/* ---------------- Modal sederhana ---------------- */
export function Modal({ terbuka, children, onTutup, lebar = "max-w-md" }) {
  if (!terbuka) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-laut-tua/40 p-4 backdrop-blur-sm">
      <div className={`kartu anim-pop w-full ${lebar} p-6 text-center`}>
        {children}
        {onTutup && (
          <div className="mt-5">
            <Tombol onClick={onTutup} className="px-8 py-3 text-lg">
              Tutup
            </Tombol>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Pemberitahuan stiker baru ---------------- */
export function StikerPopup() {
  const { stikerBaru, tutupStiker } = useGame();
  useEffect(() => {
    if (stikerBaru) sfx("buka");
  }, [stikerBaru]);
  if (!stikerBaru) return null;
  return (
    <Modal terbuka onTutup={tutupStiker}>
      <div className="text-6xl anim-bobbing">{stikerBaru.emoji}</div>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-laut">Stiker baru!</p>
      <h3 className="text-2xl font-bold text-laut-tua">{stikerBaru.nama}</h3>
      <p className="mt-1 text-laut-tua/70">{stikerBaru.desc}</p>
    </Modal>
  );
}

/* ---------------- Tautan kartu menu ---------------- */
export function KartuMenu({ href, emoji, judul, sub, warna, disabled }) {
  const { nyalakanAudio } = useGame();
  const isi = (
    <div
      className={`kartu flex items-center gap-4 p-4 transition-transform ${
        disabled ? "opacity-60" : "hover:-translate-y-1 hover:shadow-xl"
      }`}
      style={{ borderColor: warna }}
    >
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${warna}33` }}>
        {emoji}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-lg font-bold text-laut-tua">{judul}</span>
        {sub && <span className="block text-sm text-laut-tua/70">{sub}</span>}
      </span>
      <span className="text-2xl">{disabled ? "🔒" : "▶️"}</span>
    </div>
  );
  if (disabled) return <div>{isi}</div>;
  return (
    <Link
      href={href}
      onClick={() => {
        nyalakanAudio();
        sfx("tap");
      }}
    >
      {isi}
    </Link>
  );
}

/* ---------------- Kumpulan kelompok benda (bantuan visual perkalian) ---------------- */
export function KelompokBenda({ kelompok, isi, emoji = "🐟" }) {
  const daftar = useMemo(() => Array.from({ length: kelompok }, (_, i) => i), [kelompok]);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {daftar.map((g) => (
        <div
          key={g}
          className="anim-pop rounded-2xl border-2 border-dashed border-laut/50 bg-white/70 p-2"
          style={{ animationDelay: `${g * 0.08}s` }}
        >
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: isi }, (_, i) => (
              <span key={i} className="text-lg sm:text-2xl">
                {emoji}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
