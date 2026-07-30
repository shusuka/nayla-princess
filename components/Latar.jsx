"use client";

// Latar langit biru bergerak: matahari, awan, balon, burung, bukit, dan rumput.
// Semua nilai dibuat tetap (bukan acak) agar tidak bentrok saat hidrasi.

const AWAN = [
  { atas: "6%", skala: 1, durasi: 46, tunda: 0, opasitas: 0.95 },
  { atas: "18%", skala: 0.66, durasi: 62, tunda: -18, opasitas: 0.8 },
  { atas: "30%", skala: 1.25, durasi: 78, tunda: -40, opasitas: 0.7 },
  { atas: "44%", skala: 0.5, durasi: 55, tunda: -30, opasitas: 0.6 },
];

const BALON = [
  { kiri: "12%", warna: "#ff9bc4", durasi: 26, tunda: -4, skala: 0.9 },
  { kiri: "72%", warna: "#ffd86e", durasi: 34, tunda: -16, skala: 1.1 },
  { kiri: "44%", warna: "#7ee8b2", durasi: 40, tunda: -28, skala: 0.75 },
  { kiri: "88%", warna: "#b79cff", durasi: 30, tunda: -22, skala: 0.85 },
];

const BURUNG = [
  { atas: "14%", durasi: 22, tunda: 0, skala: 1 },
  { atas: "22%", durasi: 22, tunda: -1.4, skala: 0.75 },
  { atas: "9%", durasi: 34, tunda: -12, skala: 0.6 },
];

function Awan({ atas, skala, durasi, tunda, opasitas }) {
  return (
    <div
      className="absolute"
      style={{
        top: atas,
        left: 0,
        opacity: opasitas,
        transform: `scale(${skala})`,
        animation: `awan-jalan ${durasi}s linear ${tunda}s infinite`,
      }}
    >
      <svg width="150" height="70" viewBox="0 0 150 70" aria-hidden="true">
        <g fill="#ffffff">
          <ellipse cx="45" cy="45" rx="34" ry="24" />
          <ellipse cx="80" cy="34" rx="30" ry="26" />
          <ellipse cx="108" cy="47" rx="28" ry="20" />
          <rect x="30" y="42" width="90" height="24" rx="14" />
        </g>
      </svg>
    </div>
  );
}

function Balon({ kiri, warna, durasi, tunda, skala }) {
  return (
    <div
      className="absolute bottom-0"
      style={{
        left: kiri,
        transform: `scale(${skala})`,
        animation: `balon-naik ${durasi}s linear ${tunda}s infinite`,
      }}
    >
      <svg width="46" height="76" viewBox="0 0 46 76" aria-hidden="true">
        <ellipse cx="23" cy="26" rx="20" ry="25" fill={warna} />
        <ellipse cx="16" cy="18" rx="6" ry="9" fill="#fff" opacity="0.45" />
        <path d="M23 51 L18 58 L28 58 Z" fill={warna} />
        <path d="M23 58 q 8 10 0 18" stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8" />
      </svg>
    </div>
  );
}

function Burung({ atas, durasi, tunda, skala }) {
  return (
    <div
      className="absolute"
      style={{
        top: atas,
        left: 0,
        transform: `scale(${skala})`,
        animation: `awan-jalan ${durasi}s linear ${tunda}s infinite`,
      }}
    >
      <svg width="44" height="24" viewBox="0 0 44 24" aria-hidden="true">
        <path fill="none" stroke="#2f6ede" strokeWidth="3" strokeLinecap="round" opacity="0.55">
          <animate
            attributeName="d"
            dur="0.7s"
            repeatCount="indefinite"
            values="M4 14 q 9 -10 18 0 q 9 -10 18 0; M4 8 q 9 8 18 0 q 9 8 18 0; M4 14 q 9 -10 18 0 q 9 -10 18 0"
          />
        </path>
      </svg>
    </div>
  );
}

export default function Latar({ rumput = true }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* matahari */}
      <div className="absolute -right-10 -top-10">
        <div className="anim-napas">
          <svg width="200" height="200" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="120" cy="80" r="70" fill="#ffe9a8" opacity="0.55" />
            <circle cx="120" cy="80" r="48" fill="#ffd86e" />
          </svg>
        </div>
      </div>

      {AWAN.map((a, i) => (
        <Awan key={`awan-${i}`} {...a} />
      ))}
      {BURUNG.map((b, i) => (
        <Burung key={`burung-${i}`} {...b} />
      ))}
      {BALON.map((b, i) => (
        <Balon key={`balon-${i}`} {...b} />
      ))}

      {rumput && (
        <div className="absolute inset-x-0 bottom-0">
          {/* bukit */}
          <svg viewBox="0 0 1200 220" preserveAspectRatio="none" className="h-[26vh] w-full" aria-hidden="true">
            <path d="M0 120 Q 200 40 420 110 T 840 100 T 1200 130 L 1200 220 L 0 220 Z" fill="#a7e9c5" />
            <path d="M0 160 Q 260 90 560 150 T 1200 160 L 1200 220 L 0 220 Z" fill="#7ee8b2" />
          </svg>
          {/* rumput bergoyang */}
          <div className="absolute inset-x-0 bottom-0 flex justify-around">
            {Array.from({ length: 22 }, (_, i) => (
              <div
                key={`rumput-${i}`}
                style={{
                  animation: `rumput-goyang ${2 + (i % 5) * 0.35}s ease-in-out ${i * 0.11}s infinite`,
                  transformOrigin: "bottom center",
                }}
              >
                <svg width="18" height="34" viewBox="0 0 18 34" aria-hidden="true">
                  <path d="M9 34 C 4 22, 3 12, 8 2" stroke="#4bc98c" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M9 34 C 14 24, 15 16, 12 8" stroke="#3fbd84" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
