"use client";

import { useId } from "react";
import { campur } from "@/lib/gerak";

// Hewan-hewan kecil bergaya clay 3D: shading volumetrik, kilap, mata berkilau,
// dan gerakan hidup (ekor, sirip, sayap). Dipakai di mini game dan di latar.

function useU(awalan) {
  return `${awalan}${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

function Mata({ cx, cy, r = 5, warna = "#1b3a6b" }) {
  return (
    <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "kedip-mata 4s infinite" }}>
      <circle cx={cx} cy={cy} r={r} fill={warna} />
      <circle cx={cx + r * 0.35} cy={cy - r * 0.35} r={r * 0.42} fill="#fff" />
      <circle cx={cx - r * 0.35} cy={cy + r * 0.4} r={r * 0.18} fill="#fff" opacity="0.8" />
    </g>
  );
}

/** Ikan bulat 3D. `warna` = warna badan. */
export function Ikan({ warna = "#ff9b54", ukuran = 90, senang = false, arah = 1 }) {
  const u = useU("f");
  const terang = campur(warna, "#ffffff", 0.6);
  const gelap = campur(warna, "#7a2d00", 0.35);
  return (
    <svg viewBox="0 0 120 90" width={ukuran} height={ukuran * 0.75} aria-hidden="true" style={{ transform: `scaleX(${arah})`, overflow: "visible" }}>
      <defs>
        <radialGradient id={`${u}-b`} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor={terang} />
          <stop offset="55%" stopColor={warna} />
          <stop offset="100%" stopColor={gelap} />
        </radialGradient>
        <linearGradient id={`${u}-s`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={gelap} />
          <stop offset="100%" stopColor={warna} />
        </linearGradient>
      </defs>
      {/* ekor */}
      <path d="M22 45 L2 26 Q 8 45 2 64 Z" fill={`url(#${u}-s)`} stroke={gelap} strokeWidth="2" strokeLinejoin="round">
        <animateTransform attributeName="transform" type="rotate" values="-14 22 45;14 22 45;-14 22 45" dur="0.6s" repeatCount="indefinite" />
      </path>
      {/* sirip atas */}
      <path d="M48 20 Q 62 2 80 18 Z" fill={`url(#${u}-s)`} stroke={gelap} strokeWidth="2" strokeLinejoin="round" />
      {/* badan */}
      <ellipse cx="62" cy="45" rx="42" ry="28" fill={`url(#${u}-b)`} stroke={gelap} strokeWidth="2" strokeOpacity="0.6" />
      {/* sisik lembut */}
      <g stroke="#fff" strokeOpacity="0.45" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M46 36 q 5 6 0 12 M56 32 q 6 8 0 16 M66 34 q 5 7 0 14" />
      </g>
      {/* sirip samping */}
      <path d="M58 52 q 10 14 20 4" fill={terang} stroke={gelap} strokeWidth="2" strokeLinejoin="round">
        <animateTransform attributeName="transform" type="rotate" values="0 60 52;18 60 52;0 60 52" dur="0.8s" repeatCount="indefinite" />
      </path>
      {/* kilap */}
      <ellipse cx="60" cy="30" rx="18" ry="6" fill="#fff" opacity="0.55" />
      {/* pipi & mata & mulut */}
      <ellipse cx="86" cy="54" rx="6" ry="4" fill="#ff7eb6" opacity="0.5" />
      <Mata cx={88} cy={40} r={6} />
      {senang ? (
        <path d="M96 52 q 4 6 8 0" stroke="#1b3a6b" strokeWidth="2.5" fill="#c2325f" strokeLinecap="round" />
      ) : (
        <circle cx="100" cy="52" r="3" fill="#c2325f" />
      )}
      {/* gelembung */}
      <circle cx="110" cy="38" r="3" fill="#fff" opacity="0.7">
        <animate attributeName="cy" values="40;6;40" dur="2.2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.8;0;0.8" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/** Tikus kecil 3D yang lari (kaki bergerak). */
/**
 * Kucing kecil tampak samping yang sedang berjalan (kaki melangkah bergantian, ekor melambai,
 * kepala sedikit mengangguk). Menghadap ke kanan; balik arah dengan `arah={-1}`.
 * `tempo` = lama satu langkah (detik), `belang` = warna loreng (opsional).
 */
export function KucingJalan({ warna = "#ffffff", belang, ukuran = 70, arah = 1, tempo = 0.5 }) {
  const u = useU("kj");
  const terang = campur(warna, "#ffffff", 0.55);
  const gelap = campur(warna, "#1b3a6b", 0.28);
  const garis = campur(warna, "#1b3a6b", 0.5);
  const kaki = (x, fase, depan) => (
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values={`-22 ${x} 52;22 ${x} 52;-22 ${x} 52`}
        dur={`${tempo * 2}s`}
        begin={`${-fase * tempo}s`}
        repeatCount="indefinite"
      />
      <rect x={x - 4.5} y="50" width="9" height="20" rx="4.5" fill={depan ? `url(#${u}-b)` : gelap} stroke={garis} strokeWidth="1.6" />
      <ellipse cx={x} cy="69" rx="6" ry="3.6" fill={depan ? terang : gelap} stroke={garis} strokeWidth="1.4" />
    </g>
  );
  return (
    <svg viewBox="0 0 120 80" width={ukuran} height={ukuran * (80 / 120)} aria-hidden="true" style={{ transform: `scaleX(${arah})`, overflow: "visible" }}>
      <defs>
        <radialGradient id={`${u}-b`} cx="45%" cy="30%" r="80%">
          <stop offset="0%" stopColor={terang} />
          <stop offset="70%" stopColor={warna} />
          <stop offset="100%" stopColor={gelap} />
        </radialGradient>
      </defs>
      {/* bayangan */}
      <ellipse cx="58" cy="74" rx="38" ry="4" fill="#1b3a6b" opacity="0.14" />
      {/* kaki belakang (di balik badan) */}
      {kaki(36, 1, false)}
      {kaki(76, 0, false)}
      {/* ekor */}
      <path d="M24 40 C 8 36, 4 20, 12 10" stroke={garis} strokeWidth="11" fill="none" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-10 24 40;12 24 40;-10 24 40" dur={`${tempo * 4}s`} repeatCount="indefinite" />
      </path>
      <path d="M24 40 C 8 36, 4 20, 12 10" stroke={`url(#${u}-b)`} strokeWidth="8" fill="none" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" values="-10 24 40;12 24 40;-10 24 40" dur={`${tempo * 4}s`} repeatCount="indefinite" />
      </path>
      {/* badan, sedikit naik-turun mengikuti langkah */}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.6;0 0" dur={`${tempo}s`} repeatCount="indefinite" />
        <ellipse cx="56" cy="44" rx="34" ry="17" fill={`url(#${u}-b)`} stroke={garis} strokeWidth="1.8" />
        {belang && (
          <g stroke={belang} strokeWidth="4" strokeLinecap="round" opacity="0.8">
            <path d="M44 29 q 2 7 0 12 M54 28 q 2 8 0 13 M64 29 q 2 7 0 12" />
          </g>
        )}
        <ellipse cx="52" cy="34" rx="18" ry="5" fill="#fff" opacity="0.4" />
        {/* kepala */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-3 88 36;3 88 36;-3 88 36" dur={`${tempo * 2}s`} repeatCount="indefinite" />
          <path d="M80 22 L 83 6 L 93 17 Z" fill={`url(#${u}-b)`} stroke={garis} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M96 20 L 104 7 L 107 22 Z" fill={`url(#${u}-b)`} stroke={garis} strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M84 16 L 85 10 L 89 15 Z M100 17 L 103 12 L 104 19 Z" fill="#ff9cc8" />
          <circle cx="94" cy="32" r="17" fill={`url(#${u}-b)`} stroke={garis} strokeWidth="1.8" />
          {belang && <path d="M90 17 q 2 4 0 7 M96 16 q 1 4 -1 7" stroke={belang} strokeWidth="3" strokeLinecap="round" opacity="0.8" />}
          <Mata cx={101} cy={30} r={3.6} />
          <ellipse cx="103" cy="38" rx="4" ry="2.6" fill="#ff7eb6" opacity="0.55" />
          <path d="M108 33 l 2.2 1.6 l -2.2 1.4 z" fill="#ff7eb6" />
          <path d="M104 37 q 2 2 4 0" stroke={garis} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </g>
      </g>
      {/* kaki depan */}
      {kaki(40, 0, true)}
      {kaki(80, 1, true)}
    </svg>
  );
}

export function Tikus({ ukuran = 80, senang = false }) {
  const u = useU("t");
  return (
    <svg viewBox="0 0 120 90" width={ukuran} height={ukuran * 0.75} aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${u}-b`} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#d9dee8" />
          <stop offset="100%" stopColor="#98a3b8" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="84" rx="36" ry="5" fill="#1b3a6b" opacity="0.18" />
      {/* ekor */}
      <path d="M22 58 C 4 56, 6 36, 16 36" stroke="#f3a6bf" strokeWidth="4" fill="none" strokeLinecap="round">
        <animate attributeName="d" dur="0.5s" repeatCount="indefinite" values="M22 58 C 4 56, 6 36, 16 36; M22 58 C 2 62, 0 44, 10 40; M22 58 C 4 56, 6 36, 16 36" />
      </path>
      {/* kaki */}
      <g fill="#f3a6bf">
        <ellipse cx="44" cy="76" rx="7" ry="4">
          <animate attributeName="cx" values="40;50;40" dur="0.25s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="74" cy="76" rx="7" ry="4">
          <animate attributeName="cx" values="80;70;80" dur="0.25s" repeatCount="indefinite" />
        </ellipse>
      </g>
      {/* badan */}
      <ellipse cx="58" cy="56" rx="36" ry="22" fill={`url(#${u}-b)`} stroke="#8793a8" strokeOpacity="0.6" strokeWidth="2" />
      <ellipse cx="50" cy="44" rx="16" ry="5" fill="#fff" opacity="0.6" />
      {/* telinga */}
      <circle cx="80" cy="30" r="13" fill={`url(#${u}-b)`} stroke="#8793a8" strokeOpacity="0.6" strokeWidth="2" />
      <circle cx="80" cy="30" r="8" fill="#ffc2d6" />
      {/* kepala */}
      <ellipse cx="92" cy="52" rx="20" ry="16" fill={`url(#${u}-b)`} stroke="#8793a8" strokeOpacity="0.6" strokeWidth="2" />
      <Mata cx={96} cy={46} r={4.5} />
      <circle cx="112" cy="54" r="4.5" fill="#ff7eb6" />
      <circle cx="111" cy="52.5" r="1.5" fill="#fff" />
      <path d="M104 58 h14 M104 54 l12 -4 M104 60 l12 4" stroke="#8793a8" strokeWidth="1.3" strokeLinecap="round" />
      {senang && <path d="M96 58 q 4 5 8 0" stroke="#1b3a6b" strokeWidth="2" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

/** Burung bulat mungil yang mengepakkan sayap. */
export function Burung({ warna = "#6ec6ff", ukuran = 54 }) {
  const u = useU("b");
  const gelap = campur(warna, "#1b3a6b", 0.35);
  return (
    <svg viewBox="0 0 80 64" width={ukuran} height={ukuran * 0.8} aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`${u}-b`} cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor={campur(warna, "#ffffff", 0.65)} />
          <stop offset="55%" stopColor={warna} />
          <stop offset="100%" stopColor={gelap} />
        </radialGradient>
      </defs>
      <path d="M14 34 L0 26 L4 40 Z" fill={gelap} />
      <ellipse cx="38" cy="36" rx="26" ry="22" fill={`url(#${u}-b)`} />
      <ellipse cx="42" cy="44" rx="14" ry="10" fill="#fff" opacity="0.7" />
      <ellipse cx="32" cy="24" rx="10" ry="4" fill="#fff" opacity="0.5" />
      {/* sayap */}
      <path d="M26 34 Q 34 6 50 30 Z" fill={gelap} style={{ transformBox: "fill-box", transformOrigin: "50% 100%", animation: "kepak-sayap 0.28s ease-in-out infinite" }} />
      <Mata cx={52} cy={30} r={4} />
      <path d="M62 34 L74 37 L62 41 Z" fill="#ffb627" />
      <ellipse cx="52" cy="40" rx="4" ry="2.5" fill="#ff7eb6" opacity="0.6" />
    </svg>
  );
}

/** Kupu-kupu dengan sayap polkadot. */
export function KupuKupu({ warna = "#ff8fc0", ukuran = 44 }) {
  const u = useU("k");
  return (
    <svg viewBox="0 0 60 50" width={ukuran} height={ukuran * 0.84} aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <pattern id={`${u}-p`} width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill={warna} />
          <circle cx="3.5" cy="3.5" r="1.4" fill="#fff" />
        </pattern>
      </defs>
      <g style={{ transformOrigin: "30px 25px", animation: "kepak 0.35s ease-in-out infinite" }}>
        <path d="M30 25 C 10 0, 0 14, 10 24 C 0 36, 14 46, 30 27 Z" fill={`url(#${u}-p)`} stroke="#fff" strokeWidth="1.5" />
        <path d="M30 25 C 50 0, 60 14, 50 24 C 60 36, 46 46, 30 27 Z" fill={`url(#${u}-p)`} stroke="#fff" strokeWidth="1.5" />
      </g>
      <ellipse cx="30" cy="26" rx="2.6" ry="11" fill="#5b3a7a" />
      <path d="M29 16 q -4 -8 -8 -9 M31 16 q 4 -8 8 -9" stroke="#5b3a7a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Mangkuk makanan untuk game "Kasih Makan Kucing". */
export function Makanan({ ukuran = 70 }) {
  const u = useU("m");
  return (
    <svg viewBox="0 0 80 64" width={ukuran} height={ukuran * 0.8} aria-hidden="true">
      <defs>
        <linearGradient id={`${u}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fb3ff" />
          <stop offset="100%" stopColor="#3d6bff" />
        </linearGradient>
      </defs>
      {/* ikan di atas mangkuk */}
      <g transform="translate(14 2) scale(0.44)">
        <ellipse cx="62" cy="45" rx="42" ry="24" fill="#ffb27a" />
        <path d="M22 45 L4 30 L4 60 Z" fill="#f08a4b" />
        <circle cx="88" cy="40" r="5" fill="#1b3a6b" />
        <ellipse cx="60" cy="34" rx="16" ry="5" fill="#fff" opacity="0.6" />
      </g>
      <path d="M6 30 h68 q -4 30 -34 30 q -30 0 -34 -30 Z" fill={`url(#${u}-m)`} />
      <ellipse cx="40" cy="30" rx="34" ry="6" fill="#bcd2ff" />
      <path d="M14 38 q 4 12 16 16" stroke="#fff" strokeWidth="3" opacity="0.5" fill="none" strokeLinecap="round" />
      <circle cx="58" cy="44" r="2.5" fill="#fff" />
      <circle cx="50" cy="48" r="2.5" fill="#fff" />
      <circle cx="64" cy="38" r="2" fill="#fff" />
    </svg>
  );
}
