"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useGame } from "@/lib/store";
import { dengarLagu, gantiLagu, infoLagu, sfx } from "@/lib/sound";

/* ================================================================
   Ikon SVG buatan sendiri (tebal, bulat, ramah anak)
   ================================================================ */
export function Ikon({ nama, ukuran = 24, className = "" }) {
  const p = { width: ukuran, height: ukuran, viewBox: "0 0 32 32", "aria-hidden": true, className };
  switch (nama) {
    case "ikan":
      return (
        <svg {...p}>
          <defs>
            <radialGradient id="ik-koin" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff3c4" />
              <stop offset="55%" stopColor="#ffc94d" />
              <stop offset="100%" stopColor="#d9921f" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="15" fill="url(#ik-koin)" stroke="#c8841e" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="11.5" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.2" />
          <path d="M8 16 q 5 -7 12 0 q -7 7 -12 0 Z M20 16 l 5 -4 v 8 Z" fill="#fff" />
          <circle cx="11.5" cy="15" r="1.2" fill="#d9921f" />
        </svg>
      );
    case "permata":
      return (
        <svg {...p}>
          <defs>
            <linearGradient id="ik-per" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d9ccff" />
              <stop offset="50%" stopColor="#a98bff" />
              <stop offset="100%" stopColor="#6b46e0" />
            </linearGradient>
          </defs>
          <path d="M9 4 h14 l 7 8 -14 17 -14 -17 Z" fill="url(#ik-per)" stroke="#5b3ac7" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M2 12 h28 M9 4 l 7 25 M23 4 l -7 25 M9 4 l -2.5 8 M23 4 l 2.5 8" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.1" fill="none" />
          <path d="M11 6 l 3 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "bintang":
      return (
        <svg {...p}>
          <defs>
            <linearGradient id="ik-bin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff1a8" />
              <stop offset="55%" stopColor="#ffc94d" />
              <stop offset="100%" stopColor="#e89a1c" />
            </linearGradient>
          </defs>
          <path d="M16 2.5 l 4.1 8.4 9.2 1.3 -6.7 6.5 1.6 9.2 -8.2 -4.3 -8.2 4.3 1.6 -9.2 -6.7 -6.5 9.2 -1.3 Z" fill="url(#ik-bin)" stroke="#c8841e" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M12 11 q 2 -3 4 -4" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "kembali":
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 7 L10 16 L19 25" />
        </svg>
      );
    case "gir":
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="16" cy="16" r="4.5" />
          <path d="M16 3 v4 M16 25 v4 M3 16 h4 M25 16 h4 M6.8 6.8 l2.8 2.8 M22.4 22.4 l2.8 2.8 M6.8 25.2 l2.8 -2.8 M22.4 9.6 l2.8 -2.8" />
          <circle cx="16" cy="16" r="9.5" />
        </svg>
      );
    case "gembok":
      return (
        <svg {...p}>
          <path d="M10 14 v-4 a 6 6 0 0 1 12 0 v4" stroke="#8aa0c4" strokeWidth="3" fill="none" />
          <rect x="6" y="13" width="20" height="16" rx="5" fill="#b8c6de" stroke="#8aa0c4" strokeWidth="1.5" />
          <circle cx="16" cy="20" r="2.4" fill="#5d739a" />
          <path d="M16 21 v3" stroke="#5d739a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "main":
      return (
        <svg {...p}>
          <path d="M11 7 L25 16 L11 25 Z" fill="currentColor" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      );
    case "centang":
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 l6 6 L25 9" />
        </svg>
      );
    case "lampu":
      return (
        <svg {...p}>
          <path d="M16 3 a 9 9 0 0 1 5 16.5 V 23 H 11 v -3.5 A 9 9 0 0 1 16 3 Z" fill="#ffe27a" stroke="#d9921f" strokeWidth="1.6" />
          <rect x="11" y="23" width="10" height="5" rx="2" fill="#8aa0c4" />
          <path d="M12 10 q 1 -3 4 -4" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "ulang":
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M25 13 A 10 10 0 1 0 26 19" />
          <path d="M26 6 v7 h-7" />
        </svg>
      );
    case "panah":
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 16 h17 M17 9 l7 7 -7 7" />
        </svg>
      );
    case "api":
      return (
        <svg {...p}>
          <path d="M16 3 C 18 9, 25 11, 25 19 a 9 9 0 0 1 -18 0 c 0 -4 2 -6 4 -8 c 0 3 1 5 3 5 c -1 -5 0 -9 2 -13 Z" fill="#ff8a4a" />
          <path d="M16 15 c 2 3 5 4 5 7 a 5 5 0 0 1 -10 0 c 0 -2 1 -3 2 -4 c 0 2 1 3 2 3 c -1 -2 0 -4 1 -6 Z" fill="#ffd66b" />
        </svg>
      );
    default: {
      const garis = IKON_GARIS[nama];
      if (!garis) return null;
      return (
        <svg {...p} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          {garis}
        </svg>
      );
    }
  }
}

// Ikon garis sederhana (warna mengikuti teks) untuk tombol & pilihan obrolan.
const IKON_GARIS = {
  "layar-penuh": <path d="M5 12 V5 h7 M20 5 h7 v7 M27 20 v7 h-7 M12 27 H5 v-7" />,
  "layar-kecil": <path d="M12 5 v7 H5 M27 12 h-7 V5 M20 27 v-7 h7 M5 20 h7 v7" />,
  obrolan: (
    <>
      <path d="M6 8 h20 a3 3 0 0 1 3 3 v9 a3 3 0 0 1 -3 3 H14 l-6 5 v-5 H6 a3 3 0 0 1 -3 -3 v-9 a3 3 0 0 1 3 -3 Z" />
      <path d="M10 15.5 h0.1 M16 15.5 h0.1 M22 15.5 h0.1" strokeWidth="3.6" />
    </>
  ),
  musik: (
    <>
      <path d="M12 23 V7 l14 -3 v16" />
      <circle cx="9" cy="23" r="3.5" />
      <circle cx="23" cy="20" r="3.5" />
    </>
  ),
  lanjut: <path d="M7 7 l11 9 -11 9 Z M24 7 v18" />,
  tutup: <path d="M8 8 l16 16 M24 8 L8 24" />,
  hati: <path d="M16 27 C 6 20 3 14 5 9.5 C 7 5 13 5 16 10 C 19 5 25 5 27 9.5 C 29 14 26 20 16 27 Z" />,
  tanya: (
    <>
      <path d="M11 11 a5 5 0 1 1 7 4.6 c-1.4 .6 -2 1.6 -2 3 V20" />
      <path d="M16 25.5 h0.1" strokeWidth="3.6" />
    </>
  ),
  buku: (
    <>
      <path d="M16 8 C 12 5 7 5 4 6 V25 C 7 24 12 24 16 27 C 20 24 25 24 28 25 V6 C 25 5 20 5 16 8 Z" />
      <path d="M16 8 V27" />
    </>
  ),
  pensil: (
    <>
      <path d="M21 5 l6 6 L12 26 H6 v-6 Z" />
      <path d="M18 8 l6 6" />
    </>
  ),
  senyum: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M11 18.5 q5 5 10 0 M12 12.5 h0.1 M20 12.5 h0.1" />
    </>
  ),
  datar: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M11.5 20 h9 M12 12.5 h0.1 M20 12.5 h0.1" />
    </>
  ),
  sedih: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M11 21.5 q5 -5 10 0 M12 12.5 h0.1 M20 12.5 h0.1" />
    </>
  ),
  kantuk: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M10.5 13.5 q2 1.6 4 0 M17.5 13.5 q2 1.6 4 0 M13.5 20.5 h5" />
    </>
  ),
  jam: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M16 9 v7 l5 3" />
    </>
  ),
  lambai: (
    <>
      <path d="M10 17 V9 a2 2 0 0 1 4 0 v6 M14 15 V7 a2 2 0 0 1 4 0 v8 M18 15 V8.5 a2 2 0 0 1 4 0 V18 c0 5 -3 9 -8 9 c-4 0 -6 -2 -8 -6 l-2 -4 a2 2 0 0 1 3.4 -2 L10 17" />
      <path d="M25 5 q2 2 2 5 M5 6 q-1.5 2 -1 4.5" />
    </>
  ),
};

/* ================================================================
   Percikan kilau di titik ketukan (dipakai tombol)
   ================================================================ */
function percikan(e, warna = ["#ffd66b", "#ff8fc0", "#fff", "#6ec6ff"]) {
  if (typeof document === "undefined" || e.clientX == null) return;
  const lapis = document.getElementById("lapis-efek");
  if (!lapis) return;
  for (let i = 0; i < 8; i++) {
    const s = document.createElement("span");
    const sudut = (Math.PI * 2 * i) / 8 + Math.random() * 0.4;
    const jarak = 34 + Math.random() * 26;
    s.className = "absolute block";
    s.style.left = `${e.clientX}px`;
    s.style.top = `${e.clientY}px`;
    const besar = 6 + Math.random() * 6;
    s.style.width = `${besar}px`;
    s.style.height = `${besar}px`;
    s.style.background = warna[i % warna.length];
    s.style.borderRadius = i % 2 ? "50%" : "2px";
    s.style.setProperty("--dx", `${Math.cos(sudut) * jarak}px`);
    s.style.setProperty("--dy", `${Math.sin(sudut) * jarak}px`);
    s.style.setProperty("--rot", `${Math.random() * 360}deg`);
    s.style.animation = "percik 0.6s var(--ease-halus) forwards";
    s.addEventListener("animationend", () => s.remove());
    lapis.appendChild(s);
  }
}

/** Lapisan efek global: cincin kecil & kilau di setiap ketukan. Dipasang sekali di layout. */
export function LapisEfek() {
  useEffect(() => {
    const lapis = document.getElementById("lapis-efek");
    const ketuk = (e) => {
      if (!lapis || e.pointerType === "mouse" && e.button !== 0) return;
      const c = document.createElement("span");
      c.className = "absolute block rounded-full border-4 border-white/90";
      c.style.left = `${e.clientX}px`;
      c.style.top = `${e.clientY}px`;
      c.style.width = "46px";
      c.style.height = "46px";
      c.style.boxShadow = "0 0 12px rgba(255,214,107,.8)";
      c.style.animation = "cincin-sentuh 0.5s var(--ease-halus) forwards";
      c.addEventListener("animationend", () => c.remove());
      lapis.appendChild(c);
    };
    window.addEventListener("pointerdown", ketuk, { passive: true });
    return () => window.removeEventListener("pointerdown", ketuk);
  }, []);
  return <div id="lapis-efek" className="pointer-events-none fixed inset-0 z-[70] overflow-hidden" aria-hidden="true" />;
}

/* ================================================================
   Tombol besar clay 3D
   ================================================================ */
export function Tombol({
  children,
  warna = "#3d6bff",
  bayangan = "#2a4fd6",
  className = "",
  onClick,
  href,
  disabled,
  suara = "tap",
  style,
  ...sisa
}) {
  const router = useRouter();
  const { nyalakanAudio } = useGame();

  const tekan = (e) => {
    nyalakanAudio();
    sfx(suara);
    percikan(e);
    if (onClick) onClick(e);
    if (href) {
      e.preventDefault();
      setTimeout(() => router.push(href), 110);
    }
  };

  return (
    <button
      type="button"
      onClick={tekan}
      disabled={disabled}
      className={`tombol-3d ${className}`}
      style={{ backgroundColor: warna, "--bayangan": bayangan, ...style }}
      {...sisa}
    >
      {children}
    </button>
  );
}

/* ================================================================
   Angka yang menghitung naik/turun dengan halus + "denyut" saat berubah
   ================================================================ */
export function AngkaHidup({ nilai, className = "" }) {
  const [tampil, setTampil] = useState(nilai);
  const [denyut, setDenyut] = useState(0);
  const dari = useRef(nilai);

  useEffect(() => {
    const awal = dari.current;
    if (awal === nilai) return undefined;
    const mulai = performance.now();
    const lama = Math.min(900, 250 + Math.abs(nilai - awal) * 30);
    let raf;
    const langkah = (t) => {
      const p = Math.min(1, (t - mulai) / lama);
      const e = 1 - Math.pow(1 - p, 3);
      setTampil(Math.round(awal + (nilai - awal) * e));
      if (p < 1) raf = requestAnimationFrame(langkah);
      else dari.current = nilai;
    };
    raf = requestAnimationFrame(langkah);
    setDenyut((d) => d + 1);
    return () => cancelAnimationFrame(raf);
  }, [nilai]);

  return (
    <span key={denyut} className={`angka inline-block ${denyut ? "anim-pop" : ""} ${className}`}>
      {tampil}
    </span>
  );
}

export function PilKoin({ ikon, nilai, className = "" }) {
  return (
    <span className={`pil-koin text-base sm:text-lg ${className}`}>
      <Ikon nama={ikon} ukuran={26} />
      <AngkaHidup nilai={nilai} />
    </span>
  );
}

/* ================================================================
   Bintang emas
   ================================================================ */
export function Bintang({ jumlah = 0, dari = 5, ukuran = 22, animasi = false }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${jumlah} dari ${dari} bintang`}>
      {Array.from({ length: dari }, (_, i) => (
        <span
          key={i}
          className={animasi && i < jumlah ? "anim-pop inline-block" : "inline-block"}
          style={{
            animationDelay: animasi ? `${0.25 + i * 0.18}s` : undefined,
            filter: i < jumlah ? "drop-shadow(0 3px 4px rgba(200,132,30,.35))" : "grayscale(1)",
            opacity: i < jumlah ? 1 : 0.3,
          }}
        >
          <Ikon nama="bintang" ukuran={ukuran} />
        </span>
      ))}
    </span>
  );
}

/* ================================================================
   Bar atas: kembali + koin (pil kaca mengambang)
   ================================================================ */
export function BarAtas({ judul, kembali = "/" }) {
  const { state } = useGame();
  return (
    <div className="sticky top-0 z-30 px-3 pt-3 sm:px-5">
      <div className="kaca mx-auto flex max-w-4xl items-center justify-between gap-3 rounded-full py-1.5 pl-1.5 pr-2">
        <Tombol
          href={kembali}
          warna="#ffffff"
          bayangan="#c9dcf5"
          className="!text-laut-tua grid h-11 w-11 shrink-0 place-items-center !rounded-full"
          aria-label="Kembali"
        >
          <Ikon nama="kembali" ukuran={22} />
        </Tombol>
        {judul && (
          <h1 className="min-w-0 flex-1 truncate px-1 text-center text-lg font-bold text-tinta sm:text-2xl">{judul}</h1>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <PilKoin ikon="ikan" nilai={state.ikan} />
          <PilKoin ikon="permata" nilai={state.permata} className="hidden sm:inline-flex" />
          {/* di ponsel judul butuh tempat; layar penuh tetap bisa dinyalakan dari beranda */}
          <TombolLayarPenuh className="!hidden sm:!grid" />
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Gelembung bicara Mimi — muncul memantul setiap teksnya berganti
   ================================================================ */
export function Gelembung({ children, className = "" }) {
  const kunci = typeof children === "string" ? children : JSON.stringify(children?.toString?.());
  return (
    <div
      key={kunci}
      className={`anim-pop relative max-w-xs rounded-[28px] border-[3px] border-white bg-white/95 px-5 py-3 text-center font-display text-lg font-semibold leading-snug text-tinta sm:text-xl ${className}`}
      style={{ boxShadow: "0 16px 30px -12px rgb(27 58 107 / .35), inset 0 -4px 0 rgb(61 107 255 / .08)" }}
    >
      {children}
      <span className="absolute -bottom-3 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[14px] border-x-transparent border-t-white" />
    </div>
  );
}

/* ================================================================
   Konfeti: bulat, pita, bintang, dan hati
   ================================================================ */
const WARNA_KONFETI = ["#ffd66b", "#5fd6a4", "#ff8fc0", "#a98bff", "#3d6bff", "#ffb27a", "#ffffff"];

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
            tunda: sebaran(i, 2) * 0.4,
            durasi: 1.6 + sebaran(i, 3) * 1.4,
            warna: WARNA_KONFETI[i % WARNA_KONFETI.length],
            putar: 360 + sebaran(i, 4) * 900,
            angin: (sebaran(i, 5) - 0.5) * 160,
            bentuk: i % 5,
            besar: 8 + sebaran(i, 6) * 8,
          }))
        : [],
    [aktif, jumlah]
  );

  if (!potongan.length) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      {potongan.map((p) => {
        const gaya = {
          left: `${p.kiri}%`,
          "--putar": `${p.putar}deg`,
          "--angin": `${p.angin}px`,
          animation: `jatuh-konfeti ${p.durasi}s cubic-bezier(.25,.46,.45,.94) ${p.tunda}s forwards`,
        };
        if (p.bentuk === 3 || p.bentuk === 4) {
          return (
            <svg key={p.id} className="absolute top-[-24px]" style={gaya} width={p.besar * 1.6} height={p.besar * 1.6} viewBox="0 0 20 20">
              {p.bentuk === 3 ? (
                <path d="M10 1 l2.6 5.6 6.1.7 -4.5 4.2 1.2 6 -5.4 -3 -5.4 3 1.2 -6 -4.5 -4.2 6.1 -.7 Z" fill={p.warna === "#ffffff" ? "#ffd66b" : p.warna} />
              ) : (
                <path d="M10 18 C -2 10, 3 0, 10 6 C 17 0, 22 10, 10 18 Z" fill={p.warna === "#ffffff" ? "#ff8fc0" : p.warna} />
              )}
            </svg>
          );
        }
        return (
          <span
            key={p.id}
            className="absolute top-[-20px] block"
            style={{
              ...gaya,
              width: p.bentuk === 2 ? p.besar * 0.6 : p.besar,
              height: p.bentuk === 1 ? p.besar * 1.6 : p.besar,
              background: p.warna,
              borderRadius: p.bentuk === 0 ? "50%" : 3,
              boxShadow: "inset 0 -2px 0 rgba(0,0,0,.08)",
            }}
          />
        );
      })}
    </div>
  );
}

/* ================================================================
   Angka melayang (+1 ikan)
   ================================================================ */
export function Melayang({ teks, kunci }) {
  if (!teks) return null;
  return (
    <span
      key={kunci}
      className="pointer-events-none absolute left-1/2 top-1/3 z-40 -translate-x-1/2 font-display text-3xl font-bold text-white drop-shadow"
      style={{ animation: "naik-hilang 1.1s ease-out forwards" }}
    >
      {teks}
    </span>
  );
}

/* ================================================================
   Modal dengan animasi pegas
   ================================================================ */
export function Modal({ terbuka, children, onTutup, lebar = "max-w-md" }) {
  return (
    <AnimatePresence>
      {terbuka && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "radial-gradient(circle at 50% 40%, rgb(27 58 107 / .25), rgb(27 58 107 / .55))", backdropFilter: "blur(6px)" }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`kartu max-h-[92dvh] w-full overflow-y-auto ${lebar} p-6 text-center`}
            initial={{ scale: 0.6, y: 40, opacity: 0, rotate: -3 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
          >
            {children}
            {onTutup && (
              <div className="mt-5">
                <Tombol onClick={onTutup} className="px-8 py-3 text-lg">
                  Tutup
                </Tombol>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================
   Sinar berputar di belakang hadiah/medali
   ================================================================ */
export function SinarPutar({ ukuran = 260, warna = "rgba(255,214,107,.55)" }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
      style={{
        width: ukuran,
        height: ukuran,
        background: `repeating-conic-gradient(from 0deg, ${warna} 0deg 12deg, transparent 12deg 30deg)`,
        maskImage: "radial-gradient(circle, #000 20%, transparent 68%)",
        WebkitMaskImage: "radial-gradient(circle, #000 20%, transparent 68%)",
        animation: "sinar-putar 14s linear infinite",
      }}
    />
  );
}

/* ================================================================
   Pemberitahuan stiker baru: medali emas
   ================================================================ */
export function StikerPopup() {
  const { stikerBaru, tutupStiker } = useGame();
  useEffect(() => {
    if (stikerBaru) {
      sfx("buka");
      setTimeout(() => sfx("kilau"), 500);
    }
  }, [stikerBaru]);
  return (
    <Modal terbuka={!!stikerBaru} onTutup={tutupStiker}>
      {stikerBaru && (
        <>
          <div className="relative mx-auto grid h-40 w-40 place-items-center">
            <SinarPutar ukuran={280} />
            <div className="bingkai-emas relative !rounded-full">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-b from-white to-[#fff4d6] text-6xl anim-bobbing">
                {stikerBaru.emoji}
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-emas-tua">Stiker baru</p>
          <h3 className="teks-emas text-3xl font-bold">{stikerBaru.nama}</h3>
          <p className="mt-1 text-tinta-lembut">{stikerBaru.desc}</p>
        </>
      )}
    </Modal>
  );
}

/* ================================================================
   Kartu dengan kemiringan 3D + kilau holografik mengikuti jari
   ================================================================ */
export function KartuMiring({ children, className = "", kuat = 10, style, ...sisa }) {
  const ref = useRef(null);
  const gerak = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(x - 0.5) * kuat}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * kuat}deg`);
    el.style.setProperty("--foil-x", `${x * 100}%`);
    el.style.setProperty("--foil-y", `${y * 100}%`);
  };
  const lepas = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
  };
  return (
    <div style={{ perspective: 800 }} className="h-full">
      <div
        ref={ref}
        onPointerMove={gerak}
        onPointerLeave={lepas}
        className={`relative h-full ${className}`}
        style={{
          transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))",
          transition: "transform .35s var(--ease-halus)",
          transformStyle: "preserve-3d",
          ...style,
        }}
        {...sisa}
      >
        {children}
      </div>
    </div>
  );
}

/* ================================================================
   Tautan kartu menu
   ================================================================ */
export function KartuMenu({ href, emoji, judul, sub, warna, disabled, gambar, indeks = 0 }) {
  const { nyalakanAudio } = useGame();
  const isi = (
    <KartuMiring kuat={8}>
      <div
        className={`kartu group anim-muncul flex items-center gap-4 p-3 pr-4 transition-transform duration-300 ${
          disabled ? "opacity-60 grayscale" : "hover:-translate-y-1"
        }`}
        style={{ animationDelay: `${indeks * 0.07}s` }}
      >
        <span
          className="polkadot relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[22px] text-4xl"
          style={{
            backgroundColor: warna,
            "--dot": "rgba(255,255,255,.28)",
            boxShadow: `inset 0 3px 0 rgba(255,255,255,.5), inset 0 -6px 10px rgba(0,0,0,.12), 0 10px 18px -8px ${warna}`,
          }}
        >
          <span className="transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110 group-hover:-rotate-6">
            {gambar || emoji}
          </span>
        </span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block font-display text-xl font-bold leading-tight text-tinta">{judul}</span>
          {sub && <span className="mt-0.5 block text-sm leading-snug text-tinta-lembut">{sub}</span>}
        </span>
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white transition-transform duration-300 group-hover:translate-x-1"
          style={{ background: disabled ? "#b8c6de" : warna, boxShadow: "inset 0 2px 0 rgba(255,255,255,.45)" }}
        >
          {disabled ? <Ikon nama="gembok" ukuran={22} /> : <Ikon nama="main" ukuran={18} />}
        </span>
      </div>
    </KartuMiring>
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

/* ================================================================
   Kumpulan kelompok benda (bantuan visual perkalian)
   ================================================================ */
export function KelompokBenda({ kelompok, isi, emoji = "🐟" }) {
  const daftar = useMemo(() => Array.from({ length: kelompok }, (_, i) => i), [kelompok]);
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {daftar.map((g) => (
        <div
          key={g}
          className="anim-pop rounded-2xl border-2 border-dashed border-laut/40 bg-white/80 p-2 shadow-sm"
          style={{ animationDelay: `${g * 0.08}s` }}
        >
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: isi }, (_, i) => (
              <span
                key={i}
                className="inline-block text-lg sm:text-2xl"
                style={{ animation: `bobbing ${1.8 + (i % 3) * 0.3}s ease-in-out ${i * 0.07}s infinite` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================
   Layar penuh — tombol bulat di bar atas. Disembunyikan bila browser
   tidak mendukung (misal Safari di iPhone).
   ================================================================ */
function langgananLayarPenuh(cb) {
  document.addEventListener("fullscreenchange", cb);
  document.addEventListener("webkitfullscreenchange", cb);
  return () => {
    document.removeEventListener("fullscreenchange", cb);
    document.removeEventListener("webkitfullscreenchange", cb);
  };
}
const sedangLayarPenuh = () => Boolean(document.fullscreenElement || document.webkitFullscreenElement);
const dukungLayarPenuh = () => {
  const el = document.documentElement;
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
};
const langgananKosong = () => () => {};

export function TombolLayarPenuh({ className = "" }) {
  const penuh = useSyncExternalStore(langgananLayarPenuh, sedangLayarPenuh, () => false);
  const didukung = useSyncExternalStore(langgananKosong, dukungLayarPenuh, () => false);
  if (!didukung) return null;

  const ubah = async () => {
    try {
      if (sedangLayarPenuh()) {
        await (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        const el = document.documentElement;
        await (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: "hide" });
        // tablet: kunci ke posisi yang sedang dipakai supaya tidak berputar saat dipegang anak
        screen.orientation?.lock?.(screen.orientation.type).catch(() => {});
      }
    } catch {
      /* ditolak browser, abaikan */
    }
  };

  return (
    <Tombol
      warna="#ffffff"
      bayangan="#c9dcf5"
      className={`!text-tinta grid h-11 w-11 shrink-0 place-items-center !rounded-full ${className}`}
      onClick={ubah}
      aria-label={penuh ? "Keluar dari layar penuh" : "Layar penuh"}
      aria-pressed={penuh}
    >
      <Ikon nama={penuh ? "layar-kecil" : "layar-penuh"} ukuran={22} />
    </Tombol>
  );
}

/* ================================================================
   Pemutar musik mini: judul lagu yang sedang diputar + tombol ganti lagu
   ================================================================ */
export function PemutarMusik({ className = "" }) {
  const { state, nyalakanAudio } = useGame();
  const info = useSyncExternalStore(dengarLagu, infoLagu, () => null);
  if (!state.setelan.musik) return null;

  return (
    <div className={`kaca inline-flex items-center gap-2 rounded-full py-1 pl-3 pr-1 ${className}`}>
      <span className={`grid h-7 w-7 place-items-center rounded-full bg-laut text-white ${info ? "anim-denyut" : ""}`} aria-hidden="true">
        <Ikon nama="musik" ukuran={16} />
      </span>
      <span key={info?.nama || "kosong"} className="anim-pop max-w-[9.5rem] truncate text-sm font-semibold text-tinta">
        {info ? info.nama : "Ketuk untuk musik"}
      </span>
      <button
        type="button"
        onClick={() => {
          nyalakanAudio();
          sfx("pilih");
          gantiLagu();
        }}
        className="grid h-8 w-8 place-items-center rounded-full bg-white text-laut-tua shadow-sm transition-transform active:scale-90"
        aria-label="Lagu berikutnya"
      >
        <Ikon nama="lanjut" ukuran={16} />
      </button>
    </div>
  );
}
