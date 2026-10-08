"use client";

import { useEffect, useRef } from "react";
import { Burung, KucingJalan, KupuKupu } from "@/components/Hewan";
import { sfx } from "@/lib/sound";

// Latar langit berlapis (parallax): gumpalan warna, matahari bermuka, pelangi, awan 3D,
// balon & burung yang bisa diketuk, kupu-kupu polkadot, bukit, bunga, dan rumput.
// Semua nilai dibuat tetap (bukan acak) agar tidak bentrok saat hidrasi.

const AWAN = [
  { atas: "7%", skala: 1.1, durasi: 70, tunda: 0, lapis: 0.5 },
  { atas: "19%", skala: 0.7, durasi: 90, tunda: -30, lapis: 0.25 },
  { atas: "31%", skala: 1.35, durasi: 110, tunda: -62, lapis: 0.7 },
  { atas: "46%", skala: 0.55, durasi: 80, tunda: -45, lapis: 0.2 },
];

const BALON = [
  { kiri: "8%", warna: "#ff8fc0", durasi: 26, tunda: -4, skala: 0.9 },
  { kiri: "70%", warna: "#ffd66b", durasi: 32, tunda: -16, skala: 1.1 },
  { kiri: "42%", warna: "#5fd6a4", durasi: 38, tunda: -28, skala: 0.8 },
  { kiri: "88%", warna: "#a98bff", durasi: 29, tunda: -21, skala: 0.9 },
  { kiri: "24%", warna: "#6ec6ff", durasi: 35, tunda: -9, skala: 0.7, polka: true },
];

const BURUNG = [
  { atas: "13%", durasi: 24, tunda: 0, skala: 0.9, warna: "#6ec6ff" },
  { atas: "21%", durasi: 24, tunda: -1.6, skala: 0.65, warna: "#ffb27a" },
  { atas: "9%", durasi: 36, tunda: -14, skala: 0.55, warna: "#ff8fc0" },
];

const KUPU = [
  { kiri: "6%", atas: "58%", durasi: 18, tunda: 0, warna: "#ff8fc0" },
  { kiri: "56%", atas: "64%", durasi: 22, tunda: -7, warna: "#a98bff" },
];

// arah -1 = berjalan dari kanan ke kiri (animasi dibalik, gambar dicerminkan)
const KUCING_JALAN = [
  { warna: "#ffffff", ukuran: 74, durasi: 34, tunda: -4, arah: 1, tempo: 0.42, bawah: "1.2vh" },
  { warna: "#ffb27a", belang: "#e0803a", ukuran: 62, durasi: 42, tunda: -22, arah: -1, tempo: 0.48, bawah: "3.4vh" },
  { warna: "#b9c4d6", belang: "#7d8aa3", ukuran: 56, durasi: 50, tunda: -36, arah: 1, tempo: 0.52, bawah: "4.6vh" },
  { warna: "#3a3f55", ukuran: 66, durasi: 38, tunda: -12, arah: -1, tempo: 0.45, bawah: "0.6vh" },
];

const BINTANG = [
  [12, 12], [30, 6], [52, 16], [78, 9], [91, 26], [18, 34], [64, 30], [40, 40],
];

function Awan({ atas, skala, durasi, tunda, lapis }) {
  return (
    <div
      className="absolute left-0"
      style={{ top: atas, transform: `translate(calc(var(--px, 0) * ${lapis * -30}px), calc(var(--py, 0) * ${lapis * -12}px))` }}
    >
      <div style={{ animation: `awan-jalan ${durasi}s linear ${tunda}s infinite` }}>
        <svg width={170 * skala} height={86 * skala} viewBox="0 0 170 86" aria-hidden="true">
          <defs>
            <linearGradient id="awan-g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#dbe9ff" />
            </linearGradient>
          </defs>
          <g fill="url(#awan-g)">
            <ellipse cx="50" cy="54" rx="38" ry="26" />
            <ellipse cx="90" cy="40" rx="36" ry="32" />
            <ellipse cx="124" cy="56" rx="32" ry="22" />
            <rect x="30" y="52" width="110" height="30" rx="15" />
          </g>
          <ellipse cx="80" cy="26" rx="18" ry="7" fill="#fff" opacity="0.9" />
          <path d="M36 78 h100" stroke="#c9dcff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

function Balon({ kiri, warna, durasi, tunda, skala, polka }) {
  return (
    <div
      className="absolute bottom-0"
      style={{ left: kiri, transform: `scale(${skala})`, animation: `balon-naik ${durasi}s linear ${tunda}s infinite` }}
    >
      <div data-balon className="balon" style={{ animation: "balon-ayun 3s ease-in-out infinite", transformOrigin: "50% 100%" }}>
        <svg width="52" height="86" viewBox="0 0 52 86" aria-hidden="true">
          <defs>
            <radialGradient id={`bal-${warna.slice(1)}`} cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="30%" stopColor={warna} />
              <stop offset="100%" stopColor={warna} stopOpacity="0.85" />
            </radialGradient>
            <pattern id="bal-polka" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="2" fill="#fff" opacity="0.8" />
            </pattern>
          </defs>
          <ellipse cx="26" cy="29" rx="23" ry="28" fill={`url(#bal-${warna.slice(1)})`} />
          {polka && <ellipse cx="26" cy="29" rx="23" ry="28" fill="url(#bal-polka)" />}
          <ellipse cx="17" cy="18" rx="6" ry="10" fill="#fff" opacity="0.55" transform="rotate(-20 17 18)" />
          <path d="M26 57 L20 64 L32 64 Z" fill={warna} />
          <path d="M26 64 q 9 10 0 22" stroke="#ffffff" strokeWidth="1.6" fill="none" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

function Matahari() {
  return (
    <div className="absolute -right-6 -top-6" style={{ transform: "translate(calc(var(--px, 0) * -8px), calc(var(--py, 0) * -6px))" }}>
      <div className="relative h-[210px] w-[210px]">
        <div
          className="absolute left-1/2 top-1/2 h-[260px] w-[260px] rounded-full opacity-60"
          style={{
            background: "repeating-conic-gradient(from 0deg, rgba(255,230,150,0.55) 0deg 10deg, rgba(255,230,150,0) 10deg 22deg)",
            maskImage: "radial-gradient(circle, #000 30%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle, #000 30%, transparent 70%)",
            animation: "sinar-putar 40s linear infinite",
          }}
        />
        <svg className="anim-napas absolute inset-0" viewBox="0 0 210 210" aria-hidden="true">
          <defs>
            <radialGradient id="mthr" cx="38%" cy="32%" r="70%">
              <stop offset="0%" stopColor="#fff6c9" />
              <stop offset="55%" stopColor="#ffd66b" />
              <stop offset="100%" stopColor="#f2a93a" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="96" r="80" fill="#fff0b3" opacity="0.45" />
          <circle cx="110" cy="96" r="52" fill="url(#mthr)" />
          <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "kedip-mata 5s infinite" }}>
            <ellipse cx="94" cy="92" rx="4.5" ry="6" fill="#8a4a12" />
            <ellipse cx="124" cy="92" rx="4.5" ry="6" fill="#8a4a12" />
          </g>
          <ellipse cx="86" cy="106" rx="8" ry="5" fill="#ff8fc0" opacity="0.55" />
          <ellipse cx="134" cy="106" rx="8" ry="5" fill="#ff8fc0" opacity="0.55" />
          <path d="M100 108 q 9 10 18 0" stroke="#8a4a12" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

// `tenang`: untuk layar soal. Tanpa balon, burung, dan kupu-kupu, supaya anak fokus ke soal.
export default function Latar({ rumput = true, tenang = false }) {
  const akar = useRef(null);

  // Parallax lembut mengikuti kursor/jari + ketukan pada balon & burung.
  useEffect(() => {
    const el = akar.current;
    if (!el) return undefined;
    let raf = 0;
    const gerak = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    const ketuk = (e) => {
      // abaikan ketukan pada tombol/tautan/kolom isian
      if (e.target.closest?.("button, a, input, [role='button'], .kucing-3d")) return;
      const kena = (sel) =>
        [...el.querySelectorAll(sel)].find((n) => {
          const r = n.getBoundingClientRect();
          return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        });
      const balon = kena("[data-balon]:not(.meletus)");
      if (balon) {
        sfx("pop");
        balon.classList.add("meletus");
        setTimeout(() => balon.classList.remove("meletus"), 2400);
        return;
      }
      const kucing = kena("[data-kucing-jalan]");
      if (kucing) {
        sfx("meong");
        kucing.classList.remove("anim-lompat");
        void kucing.offsetWidth;
        kucing.classList.add("anim-lompat");
        return;
      }
      const burung = kena("[data-burung]");
      if (burung) {
        sfx("kicau");
        burung.classList.remove("anim-lompat");
        void burung.offsetWidth;
        burung.classList.add("anim-lompat");
      }
    };
    window.addEventListener("pointermove", gerak, { passive: true });
    window.addEventListener("pointerdown", ketuk, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", gerak);
      window.removeEventListener("pointerdown", ketuk);
    };
  }, []);

  return (
    <div ref={akar} className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* gumpalan warna lembut yang bergerak pelan */}
      <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-[#ffd3ea] opacity-60 blur-3xl anim-melayang" />
      <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-[#cfe0ff] opacity-70 blur-3xl anim-melayang" style={{ animationDelay: "-2s" }} />
      <div className="absolute left-1/3 top-0 h-72 w-72 rounded-full bg-[#fff1c4] opacity-60 blur-3xl anim-melayang" style={{ animationDelay: "-3.5s" }} />

      {/* bintang kerlip */}
      {BINTANG.map(([x, y], i) => (
        <svg
          key={`bt-${i}`}
          className="absolute"
          style={{ left: `${x}%`, top: `${y}%`, animation: `kilau ${2.2 + (i % 4) * 0.5}s ease-in-out ${i * 0.4}s infinite` }}
          width="14"
          height="14"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M10 0 Q 11.5 8.5 20 10 Q 11.5 11.5 10 20 Q 8.5 11.5 0 10 Q 8.5 8.5 10 0 Z" fill="#fff" />
        </svg>
      ))}

      {/* pelangi besar di tengah, kakinya tenggelam di balik bukit */}
      <div className="absolute left-1/2 top-[14%] w-[118vw] max-w-[1180px] -translate-x-1/2">
        <svg className="w-full opacity-40" viewBox="0 0 400 200" aria-hidden="true"
          style={{
            transform: "translate(calc(var(--px, 0) * -14px), calc(var(--py, 0) * -8px))",
            // kaki pelangi memudar, supaya di halaman tanpa bukit tidak terpotong tajam
            maskImage: "linear-gradient(to bottom, #000 72%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 72%, transparent)",
          }}>
          {["#ff8fc0", "#ffb27a", "#ffd66b", "#5fd6a4", "#6ec6ff", "#a98bff"].map((c, i) => (
            <path key={c} d={`M ${20 + i * 12} 200 A ${180 - i * 12} ${180 - i * 12} 0 0 1 ${380 - i * 12} 200`} stroke={c} strokeWidth="12" fill="none" />
          ))}
        </svg>
      </div>

      <Matahari />

      {AWAN.map((a, i) => (
        <Awan key={`awan-${i}`} {...a} />
      ))}

      {!tenang && BURUNG.map((b, i) => (
        <div
          key={`burung-${i}`}
          className="absolute left-0"
          style={{ top: b.atas, animation: `awan-jalan ${b.durasi}s linear ${b.tunda}s infinite` }}
        >
          <div data-burung style={{ transform: `scale(${b.skala})` }}>
            <div className="anim-bobbing">
              <Burung warna={b.warna} ukuran={54} />
            </div>
          </div>
        </div>
      ))}

      {!tenang && BALON.map((b, i) => (
        <Balon key={`balon-${i}`} {...b} />
      ))}

      {rumput &&
        KUPU.map((k, i) => (
          <div
            key={`kupu-${i}`}
            className="absolute"
            style={{ left: k.kiri, top: k.atas, animation: `kupu-terbang ${k.durasi}s ease-in-out ${k.tunda}s infinite` }}
          >
            <div className="anim-bobbing">
              <KupuKupu warna={k.warna} />
            </div>
          </div>
        ))}

      {rumput && (
        <div className="absolute inset-x-0 bottom-0" style={{ transform: "translateX(calc(var(--px, 0) * 10px))" }}>
          {/* bukit berlapis */}
          <svg viewBox="0 0 1200 240" preserveAspectRatio="none" className="h-[28vh] w-[104%] -ml-[2%]" aria-hidden="true">
            <defs>
              <linearGradient id="bukit1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c7f2da" />
                <stop offset="100%" stopColor="#8fe3b8" />
              </linearGradient>
              <linearGradient id="bukit2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8ee8b9" />
                <stop offset="100%" stopColor="#4fcf93" />
              </linearGradient>
            </defs>
            <path d="M0 130 Q 200 50 420 120 T 840 110 T 1200 140 L 1200 240 L 0 240 Z" fill="url(#bukit1)" />
            <path d="M0 175 Q 260 100 560 165 T 1200 170 L 1200 240 L 0 240 Z" fill="url(#bukit2)" />
            <path d="M120 150 Q 260 110 420 140" stroke="#fff" strokeWidth="6" opacity="0.35" fill="none" strokeLinecap="round" />
          </svg>
          {/* kucing yang berlalu-lalang di tanah */}
          {KUCING_JALAN.map((k, i) => (
            <div
              key={`kj-${i}`}
              className="absolute left-0"
              style={{
                bottom: k.bawah,
                animation: `kucing-lewat ${k.durasi}s linear ${k.tunda}s infinite ${k.arah < 0 ? "reverse" : "normal"}`,
              }}
            >
              <div data-kucing-jalan>
                <KucingJalan warna={k.warna} belang={k.belang} ukuran={k.ukuran} arah={k.arah} tempo={k.tempo} />
              </div>
            </div>
          ))}
          {/* bunga & rumput bergoyang (di depan kucing) */}
          <div className="absolute inset-x-0 bottom-0 flex justify-around">
            {Array.from({ length: 34 }, (_, i) => (
              <div
                key={`rumput-${i}`}
                style={{
                  animation: `rumput-goyang ${2 + (i % 5) * 0.35}s ease-in-out ${i * 0.11}s infinite`,
                  transformOrigin: "bottom center",
                }}
              >
                {i % 4 === 1 ? (
                  <svg width="22" height="40" viewBox="0 0 22 40" aria-hidden="true">
                    <path d="M11 40 V 16" stroke="#3fbd84" strokeWidth="3" strokeLinecap="round" />
                    {[0, 72, 144, 216, 288].map((r) => (
                      <ellipse key={r} cx="11" cy="7" rx="4" ry="6" fill={["#ff8fc0", "#ffd66b", "#a98bff", "#fff"][i % 4]} transform={`rotate(${r} 11 12)`} />
                    ))}
                    <circle cx="11" cy="12" r="3.5" fill="#ffd66b" />
                  </svg>
                ) : (
                  <svg width="18" height="34" viewBox="0 0 18 34" aria-hidden="true">
                    <path d="M9 34 C 4 22, 3 12, 8 2" stroke="#3fbd84" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <path d="M9 34 C 14 24, 15 16, 12 8" stroke="#2fae75" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
