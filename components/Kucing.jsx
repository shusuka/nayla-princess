"use client";

import { KUCING_BY_ID } from "@/lib/data";

/**
 * Kucing SVG yang bisa berganti warna, ekspresi, dan aksesori.
 * ekspresi: diam | senang | sedih | kaget | tidur
 * aksi: none | lompat | goyang | putar | lambai | tepuk
 */
export default function Kucing({
  id = "mimi",
  ekspresi = "diam",
  aksi = "none",
  ukuran = 180,
  dipakai = {},
  className = "",
}) {
  const k = KUCING_BY_ID[id] || KUCING_BY_ID.mimi;
  const w = k.warna;

  const kelasAksi =
    aksi === "lompat"
      ? "anim-lompat"
      : aksi === "goyang"
        ? "anim-goyang"
        : aksi === "putar"
          ? "anim-putar"
          : "anim-napas";

  return (
    <div
      className={`inline-block ${kelasAksi} ${className}`}
      style={{ width: ukuran, height: ukuran, transformOrigin: "50% 85%" }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
        <defs>
          <radialGradient id={`glow-${id}`} cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* bayangan */}
        <ellipse cx="100" cy="188" rx="52" ry="9" fill="#2f6ede" opacity="0.18" />

        {/* ekor */}
        <path
          d="M150 155 C 182 150, 188 120, 170 108"
          stroke={w.bulu2}
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        >
          <animate
            attributeName="d"
            dur="2.6s"
            repeatCount="indefinite"
            values="M150 155 C 182 150, 188 120, 170 108;
                    M150 155 C 184 148, 192 126, 178 112;
                    M150 155 C 182 150, 188 120, 170 108"
          />
        </path>

        {/* badan */}
        <ellipse cx="100" cy="146" rx="50" ry="40" fill={w.bulu} stroke={w.garis} strokeWidth="3" />
        <ellipse cx="100" cy="152" rx="30" ry="26" fill={w.bulu2} opacity="0.75" />

        {/* baju */}
        {dipakai.baju === "baju-garis" && (
          <g>
            <path d="M62 138 A 40 40 0 0 0 138 138 L 138 168 A 44 44 0 0 1 62 168 Z" fill="#ff9bc4" />
            <path d="M60 148 h80 M60 158 h80" stroke="#fff" strokeWidth="5" opacity="0.85" />
          </g>
        )}
        {dipakai.baju === "baju-pelaut" && (
          <g>
            <path d="M62 138 A 40 40 0 0 0 138 138 L 138 170 A 44 44 0 0 1 62 170 Z" fill="#4f8ef7" />
            <path d="M84 132 L100 152 L116 132 L108 128 L100 140 L92 128 Z" fill="#fff" />
            <circle cx="100" cy="160" r="4" fill="#ffd86e" />
          </g>
        )}

        {/* tas di punggung */}
        {dipakai.tas === "tas-ransel" && (
          <g>
            <rect x="30" y="132" width="26" height="32" rx="9" fill="#7ee8b2" stroke="#3fbd84" strokeWidth="3" />
            <rect x="34" y="142" width="18" height="9" rx="4" fill="#fff" opacity="0.8" />
          </g>
        )}
        {dipakai.tas === "tas-bintang" && (
          <g>
            <rect x="30" y="134" width="26" height="28" rx="12" fill="#b79cff" stroke="#8b6ff0" strokeWidth="3" />
            <text x="43" y="154" fontSize="14" textAnchor="middle">⭐</text>
          </g>
        )}

        {/* kaki / sepatu */}
        {dipakai.sepatu ? (
          <g>
            <ellipse cx="78" cy="182" rx="17" ry="10" fill={dipakai.sepatu === "sepatu-bot" ? "#8a5a2b" : "#ff8a8a"} />
            <ellipse cx="122" cy="182" rx="17" ry="10" fill={dipakai.sepatu === "sepatu-bot" ? "#8a5a2b" : "#ff8a8a"} />
            <path d="M64 182 h28 M108 182 h28" stroke="#fff" strokeWidth="3" opacity="0.7" />
          </g>
        ) : (
          <g>
            <ellipse cx="80" cy="181" rx="15" ry="9" fill={w.bulu} stroke={w.garis} strokeWidth="2.5" />
            <ellipse cx="120" cy="181" rx="15" ry="9" fill={w.bulu} stroke={w.garis} strokeWidth="2.5" />
          </g>
        )}

        {/* tangan kiri */}
        <g style={{ transformOrigin: "60px 140px" }}>
          {aksi === "tepuk" && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 60 140; -25 60 140; 0 60 140"
              dur="0.5s"
              repeatCount="indefinite"
            />
          )}
          <ellipse cx="58" cy="146" rx="13" ry="11" fill={w.bulu} stroke={w.garis} strokeWidth="2.5" />
        </g>

        {/* tangan kanan (melambai) */}
        <g style={{ transformOrigin: "142px 140px" }}>
          {(aksi === "lambai" || aksi === "tepuk") && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={aksi === "lambai" ? "0 142 140; -32 142 140; 6 142 140; 0 142 140" : "0 142 140; 25 142 140; 0 142 140"}
              dur={aksi === "lambai" ? "1.1s" : "0.5s"}
              repeatCount="indefinite"
            />
          )}
          <ellipse cx="142" cy="146" rx="13" ry="11" fill={w.bulu} stroke={w.garis} strokeWidth="2.5" />
        </g>

        {/* telinga */}
        <path d="M56 62 L48 20 L88 44 Z" fill={w.bulu} stroke={w.garis} strokeWidth="3" strokeLinejoin="round" />
        <path d="M62 55 L57 33 L79 46 Z" fill={w.telinga} />
        <path d="M144 62 L152 20 L112 44 Z" fill={w.bulu} stroke={w.garis} strokeWidth="3" strokeLinejoin="round" />
        <path d="M138 55 L143 33 L121 46 Z" fill={w.telinga} />

        {/* kepala */}
        <circle cx="100" cy="88" r="50" fill={w.bulu} stroke={w.garis} strokeWidth="3" />
        <circle cx="100" cy="80" r="44" fill={`url(#glow-${id})`} opacity="0.5" />

        {/* pipi merona */}
        <ellipse cx="66" cy="100" rx="11" ry="7" fill="#ff9bc4" opacity="0.55" />
        <ellipse cx="134" cy="100" rx="11" ry="7" fill="#ff9bc4" opacity="0.55" />

        {/* mata */}
        {ekspresi === "senang" ? (
          <g stroke={w.mata} strokeWidth="5" fill="none" strokeLinecap="round">
            <path d="M70 86 q 10 -13 20 0" />
            <path d="M110 86 q 10 -13 20 0" />
          </g>
        ) : ekspresi === "tidur" ? (
          <g stroke={w.mata} strokeWidth="5" fill="none" strokeLinecap="round">
            <path d="M70 86 q 10 10 20 0" />
            <path d="M110 86 q 10 10 20 0" />
          </g>
        ) : ekspresi === "sedih" ? (
          <g>
            <ellipse cx="80" cy="90" rx="9" ry="10" fill={w.mata} />
            <ellipse cx="120" cy="90" rx="9" ry="10" fill={w.mata} />
            <circle cx="83" cy="86" r="3.5" fill="#fff" />
            <circle cx="123" cy="86" r="3.5" fill="#fff" />
            <path d="M68 76 q 12 -6 22 -1 M132 76 q -12 -6 -22 -1" stroke={w.mata} strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <ellipse cx="80" cy="86" rx="10" ry={ekspresi === "kaget" ? 13 : 11} fill={w.mata}>
              <animate attributeName="ry" values="11;11;1.5;11;11" dur="4.5s" repeatCount="indefinite" />
            </ellipse>
            <ellipse cx="120" cy="86" rx="10" ry={ekspresi === "kaget" ? 13 : 11} fill={w.mata}>
              <animate attributeName="ry" values="11;11;1.5;11;11" dur="4.5s" repeatCount="indefinite" />
            </ellipse>
            <circle cx="84" cy="82" r="4" fill="#fff" />
            <circle cx="124" cy="82" r="4" fill="#fff" />
          </g>
        )}

        {/* hidung & mulut */}
        <path d="M94 102 L106 102 L100 109 Z" fill="#ff8fb1" />
        {ekspresi === "sedih" ? (
          <path d="M88 120 q 12 -8 24 0" stroke={w.mata} strokeWidth="4" fill="none" strokeLinecap="round" />
        ) : ekspresi === "senang" ? (
          <path d="M84 110 q 16 20 32 0" stroke={w.mata} strokeWidth="4" fill="#ff8fb1" strokeLinecap="round" />
        ) : (
          <path d="M100 109 q -8 10 -14 2 M100 109 q 8 10 14 2" stroke={w.mata} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        )}

        {/* kumis */}
        <g stroke={w.garis} strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
          <path d="M50 96 h20 M52 106 h18" />
          <path d="M150 96 h-20 M148 106 h-18" />
        </g>

        {/* kacamata */}
        {dipakai.kacamata === "kacamata-bulat" && (
          <g stroke="#2f6ede" strokeWidth="4" fill="#cdeeff" fillOpacity="0.45">
            <circle cx="80" cy="86" r="16" />
            <circle cx="120" cy="86" r="16" />
            <path d="M96 86 h8" />
          </g>
        )}
        {dipakai.kacamata === "kacamata-hitam" && (
          <g>
            <rect x="60" y="76" width="34" height="20" rx="8" fill="#23324a" />
            <rect x="106" y="76" width="34" height="20" rx="8" fill="#23324a" />
            <path d="M94 84 h12" stroke="#23324a" strokeWidth="5" />
            <path d="M66 82 h10" stroke="#fff" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
          </g>
        )}

        {/* topi */}
        {dipakai.topi === "topi-pesta" && (
          <g>
            <path d="M100 4 L124 48 L76 48 Z" fill="#ff9bc4" stroke="#e5709f" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="100" cy="6" r="7" fill="#ffd86e" />
            <path d="M84 40 h32" stroke="#fff" strokeWidth="4" opacity="0.8" />
          </g>
        )}
        {dipakai.topi === "topi-jerami" && (
          <g>
            <ellipse cx="100" cy="46" rx="62" ry="14" fill="#ffd86e" stroke="#e8b93f" strokeWidth="3" />
            <path d="M72 46 a 28 30 0 0 1 56 0 Z" fill="#ffd86e" stroke="#e8b93f" strokeWidth="3" />
            <path d="M72 44 q 28 10 56 0" stroke="#4f8ef7" strokeWidth="6" fill="none" />
          </g>
        )}
        {dipakai.topi === "mahkota" && (
          <g>
            <path d="M64 46 L70 14 L86 34 L100 8 L114 34 L130 14 L136 46 Z" fill="#ffd86e" stroke="#e8b93f" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="100" cy="30" r="5" fill="#ff9bc4" />
            <circle cx="76" cy="34" r="4" fill="#7ee8b2" />
            <circle cx="124" cy="34" r="4" fill="#4f8ef7" />
          </g>
        )}
      </svg>
    </div>
  );
}
