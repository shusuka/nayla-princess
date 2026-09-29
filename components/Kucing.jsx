"use client";

import { useEffect, useId, useRef } from "react";
import { KUCING_BY_ID } from "@/lib/data";
import { hentikanDengkur, mulaiDengkur, sfx } from "@/lib/sound";
import { campur, daftarkanPelacak } from "@/lib/gerak";

/**
 * Kucing SVG "3D": shading volumetrik, mata mengikuti jari/kursor, kepala menoleh,
 * kedip & telinga berkedut acak, menguap, dan bisa dielus (mendengkur + hati).
 *
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
  bisaDielus = true,
}) {
  const k = KUCING_BY_ID[id] || KUCING_BY_ID.mimi;
  const w = k.warna;
  const u = `k${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const akar = useRef(null);
  const wadahHati = useRef(null);

  // Warna turunan untuk shading 3D
  const terang = campur(w.bulu, "#ffffff", 0.75);
  const tengah = w.bulu;
  const gelap = campur(w.bulu2, w.garis, 0.55);
  const garis = campur(w.garis, "#1b3a6b", 0.18);

  // Pelacak mata/kepala + perilaku acak (kedip, telinga, menguap) tanpa render ulang React.
  useEffect(() => {
    const el = akar.current;
    if (!el) return undefined;
    const lepas = daftarkanPelacak(el);
    const timers = [];
    const kelasSebentar = (kelas, ms) => {
      el.classList.add(kelas);
      timers.push(setTimeout(() => el.classList.remove(kelas), ms));
    };
    let hidup = true;
    const jadwal = () => {
      if (!hidup) return;
      const tunggu = 1800 + Math.random() * 3200;
      timers.push(
        setTimeout(() => {
          const r = Math.random();
          if (r < 0.55) {
            kelasSebentar("kedip", 160);
            if (Math.random() < 0.3) timers.push(setTimeout(() => kelasSebentar("kedip", 140), 260));
          } else if (r < 0.78) {
            kelasSebentar(Math.random() < 0.5 ? "kedut-kiri" : "kedut-kanan", 420);
          } else if (r < 0.9) {
            kelasSebentar("kibas", 700);
          } else {
            kelasSebentar("menguap", 1500);
          }
          jadwal();
        }, tunggu)
      );
    };
    jadwal();
    return () => {
      hidup = false;
      timers.forEach(clearTimeout);
      lepas();
    };
  }, []);

  // ---------- Elus-elus ----------
  const elus = useRef({ turun: false, x: 0, y: 0, jarak: 0, terakhirHati: 0, mendengkur: false });

  const semburHati = (x, y, banyak = 1) => {
    const wadah = wadahHati.current;
    if (!wadah) return;
    const kotak = wadah.getBoundingClientRect();
    for (let i = 0; i < banyak; i++) {
      const s = document.createElement("span");
      s.textContent = ["💗", "💖", "✨", "💕"][Math.floor(Math.random() * 4)];
      s.className = "pointer-events-none absolute select-none";
      s.style.left = `${x - kotak.left - 10 + (Math.random() * 30 - 15)}px`;
      s.style.top = `${y - kotak.top - 12}px`;
      s.style.fontSize = `${Math.max(14, ukuran * 0.1)}px`;
      s.style.setProperty("--dx", `${Math.random() * 60 - 30}px`);
      s.style.setProperty("--rot", `${Math.random() * 40 - 20}deg`);
      s.style.animation = `hati-naik ${0.9 + Math.random() * 0.5}s var(--ease-halus) forwards`;
      s.addEventListener("animationend", () => s.remove());
      wadah.appendChild(s);
    }
  };

  const mulaiElus = (e) => {
    if (!bisaDielus) return;
    elus.current = { ...elus.current, turun: true, x: e.clientX, y: e.clientY, jarak: 0, barusDielus: false };
  };
  const gerakElus = (e) => {
    const s = elus.current;
    if (!s.turun) return;
    s.jarak += Math.hypot(e.clientX - s.x, e.clientY - s.y);
    s.x = e.clientX;
    s.y = e.clientY;
    if (s.jarak > 28 && !s.mendengkur) {
      s.mendengkur = true;
      akar.current?.classList.add("dielus");
      mulaiDengkur();
    }
    const kini = performance.now();
    if (s.mendengkur && kini - s.terakhirHati > 140) {
      s.terakhirHati = kini;
      semburHati(e.clientX, e.clientY);
    }
  };
  const selesaiElus = (e) => {
    const s = elus.current;
    if (!s.turun) return;
    s.turun = false;
    if (s.mendengkur) {
      s.mendengkur = false;
      s.barusDielus = true;
      akar.current?.classList.remove("dielus");
      hentikanDengkur();
    } else if (bisaDielus && e?.clientX != null && e.type === "pointerup") {
      // ketukan singkat: hati kecil + cicit lucu
      semburHati(e.clientX, e.clientY, 3);
      // di dalam tombol (misal beranda), tombolnya yang bersuara
      if (!akar.current?.parentElement?.closest("button")) sfx("cicit");
    }
  };

  useEffect(() => () => hentikanDengkur(), []);

  const kelasAksi =
    aksi === "lompat"
      ? "anim-lompat"
      : aksi === "goyang"
        ? "anim-goyang"
        : aksi === "putar"
          ? "anim-putar"
          : "anim-napas";

  const matanya = ekspresi === "diam" || ekspresi === "kaget" || ekspresi === "sedih";

  return (
    <div
      ref={akar}
      className={`kucing-3d relative inline-block ${className}`}
      style={{ width: ukuran, height: ukuran, perspective: 600 }}
      onPointerDown={mulaiElus}
      onPointerMove={gerakElus}
      onPointerUp={selesaiElus}
      onPointerLeave={selesaiElus}
      onPointerCancel={selesaiElus}
      onClick={(e) => {
        // selesai dielus bukan berarti diketuk: jangan teruskan klik ke tombol induk
        if (elus.current.barusDielus) {
          elus.current.barusDielus = false;
          e.stopPropagation();
        }
      }}
    >
      <div className={`h-full w-full ${kelasAksi}`} style={{ transformOrigin: "50% 88%" }}>
        <div className="kucing-miring h-full w-full">
          <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id={`${u}-badan`} cx="38%" cy="28%" r="80%">
                <stop offset="0%" stopColor={terang} />
                <stop offset="45%" stopColor={tengah} />
                <stop offset="100%" stopColor={gelap} />
              </radialGradient>
              <radialGradient id={`${u}-kepala`} cx="36%" cy="26%" r="78%">
                <stop offset="0%" stopColor={terang} />
                <stop offset="50%" stopColor={tengah} />
                <stop offset="100%" stopColor={gelap} />
              </radialGradient>
              <radialGradient id={`${u}-moncong`} cx="50%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor={terang} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`${u}-telinga`} cx="50%" cy="70%" r="70%">
                <stop offset="0%" stopColor={campur(w.telinga, "#ffffff", 0.35)} />
                <stop offset="100%" stopColor={campur(w.telinga, "#c2327a", 0.2)} />
              </radialGradient>
              <radialGradient id={`${u}-mata`} cx="50%" cy="60%" r="60%">
                <stop offset="0%" stopColor={campur(w.mata, "#ffffff", 0.45)} />
                <stop offset="55%" stopColor={w.mata} />
                <stop offset="100%" stopColor={campur(w.mata, "#0b1633", 0.55)} />
              </radialGradient>
              <radialGradient id={`${u}-pipi`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff7eb6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ff7eb6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${u}-hidung`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffb3cf" />
                <stop offset="100%" stopColor="#f0628f" />
              </linearGradient>
              <filter id={`${u}-lembut`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              {w.totol && (
                <>
                  <clipPath id={`${u}-klip-kepala`}>
                    <circle cx="100" cy="88" r="49" />
                  </clipPath>
                  <clipPath id={`${u}-klip-badan`}>
                    <ellipse cx="100" cy="146" rx="49" ry="39" />
                  </clipPath>
                </>
              )}
              <DefsAksesori u={u} />
            </defs>

            {/* bayangan tanah */}
            <ellipse cx="100" cy="190" rx="54" ry="8" fill="#1b3a6b" opacity="0.22" filter={`url(#${u}-lembut)`} className="kucing-bayangan" />

            {/* ekor */}
            <g className="kucing-ekor">
              <path d="M148 158 C 186 152, 190 118, 170 104" stroke={gelap} strokeWidth="17" strokeLinecap="round" fill="none">
                <animate attributeName="d" dur="2.8s" repeatCount="indefinite"
                  values="M148 158 C 186 152, 190 118, 170 104; M148 158 C 190 146, 196 124, 182 108; M148 158 C 186 152, 190 118, 170 104" />
              </path>
              <path d="M148 158 C 186 152, 190 118, 170 104" stroke={tengah} strokeWidth="11" strokeLinecap="round" fill="none">
                <animate attributeName="d" dur="2.8s" repeatCount="indefinite"
                  values="M148 158 C 186 152, 190 118, 170 104; M148 158 C 190 146, 196 124, 182 108; M148 158 C 186 152, 190 118, 170 104" />
              </path>
            </g>

            {/* badan */}
            <ellipse cx="100" cy="146" rx="50" ry="40" fill={`url(#${u}-badan)`} stroke={garis} strokeOpacity="0.45" strokeWidth="2" />
            <ellipse cx="100" cy="154" rx="29" ry="24" fill={`url(#${u}-moncong)`} opacity="0.9" />
            {w.totol && (
              <g clipPath={`url(#${u}-klip-badan)`} fill={w.totol} opacity="0.8">
                <circle cx="62" cy="130" r="8" />
                <circle cx="132" cy="138" r="9" />
                <circle cx="80" cy="170" r="6" />
                <circle cx="124" cy="170" r="7" />
                <circle cx="146" cy="112" r="5" />
              </g>
            )}
            {/* bayangan kepala jatuh ke badan (ambient occlusion) */}
            <ellipse cx="100" cy="126" rx="40" ry="10" fill={gelap} opacity="0.35" filter={`url(#${u}-lembut)`} />

            {/* baju */}
            <Baju id={dipakai.baju} u={u} />

            {/* tas di punggung */}
            <Tas id={dipakai.tas} u={u} />

            {/* kaki / sepatu */}
            {dipakai.sepatu ? (
              <Sepatu id={dipakai.sepatu} u={u} />
            ) : (
              <g>
                <ellipse cx="80" cy="181" rx="16" ry="10" fill={`url(#${u}-badan)`} stroke={garis} strokeOpacity="0.4" strokeWidth="2" />
                <ellipse cx="120" cy="181" rx="16" ry="10" fill={`url(#${u}-badan)`} stroke={garis} strokeOpacity="0.4" strokeWidth="2" />
                <path d="M74 184 v-4 M80 185 v-5 M86 184 v-4 M114 184 v-4 M120 185 v-5 M126 184 v-4" stroke={garis} strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" />
              </g>
            )}

            {/* tangan kiri */}
            <g>
              {aksi === "tepuk" && (
                <animateTransform attributeName="transform" type="rotate" values="0 60 140; -25 60 140; 0 60 140" dur="0.5s" repeatCount="indefinite" />
              )}
              <ellipse cx="58" cy="146" rx="14" ry="12" fill={`url(#${u}-badan)`} stroke={garis} strokeOpacity="0.45" strokeWidth="2" />
            </g>

            {/* tangan kanan (melambai) */}
            <g>
              {(aksi === "lambai" || aksi === "tepuk") && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={aksi === "lambai" ? "0 142 140; -34 142 140; 8 142 140; 0 142 140" : "0 142 140; 25 142 140; 0 142 140"}
                  dur={aksi === "lambai" ? "1.1s" : "0.5s"}
                  repeatCount="indefinite"
                />
              )}
              <ellipse cx="142" cy="146" rx="14" ry="12" fill={`url(#${u}-badan)`} stroke={garis} strokeOpacity="0.45" strokeWidth="2" />
            </g>

            {/* ======== KEPALA (bergerak sedikit mengikuti pandangan) ======== */}
            <g className="kucing-kepala">
              {/* telinga */}
              <g className="telinga-kiri">
                <path d="M54 64 L44 18 L90 42 Z" fill={`url(#${u}-kepala)`} stroke={garis} strokeOpacity="0.45" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M60 56 L54 30 L80 45 Z" fill={`url(#${u}-telinga)`} />
              </g>
              <g className="telinga-kanan">
                <path d="M146 64 L156 18 L110 42 Z" fill={`url(#${u}-kepala)`} stroke={garis} strokeOpacity="0.45" strokeWidth="2.5" strokeLinejoin="round" />
                <path d="M140 56 L146 30 L120 45 Z" fill={`url(#${u}-telinga)`} />
              </g>

              {/* kepala */}
              <circle cx="100" cy="88" r="50" fill={`url(#${u}-kepala)`} stroke={garis} strokeOpacity="0.45" strokeWidth="2.5" />
              {w.totol && (
                <g clipPath={`url(#${u}-klip-kepala)`} fill={w.totol} opacity="0.8">
                  <circle cx="64" cy="60" r="9" />
                  <circle cx="140" cy="70" r="7" />
                  <circle cx="100" cy="46" r="6" />
                  <circle cx="58" cy="116" r="5" />
                  <circle cx="144" cy="112" r="6" />
                </g>
              )}
              {/* kilap di dahi */}
              <ellipse cx="80" cy="58" rx="20" ry="10" fill="#ffffff" opacity="0.55" transform="rotate(-20 80 58)" />

              {/* ---- wajah (bergeser lebih jauh → kesan menoleh 3D) ---- */}
              <g className="kucing-wajah">
                {/* moncong */}
                <ellipse cx="100" cy="108" rx="26" ry="18" fill={`url(#${u}-moncong)`} />

                {/* pipi merona */}
                <ellipse className="kucing-pipi" cx="64" cy="104" rx="14" ry="9" fill={`url(#${u}-pipi)`} />
                <ellipse className="kucing-pipi" cx="136" cy="104" rx="14" ry="9" fill={`url(#${u}-pipi)`} />

                {/* mata terbuka (dipakai saat diam/kaget/sedih; disembunyikan saat dielus/menguap) */}
                {matanya && (
                  <g className="mata-buka">
                    {[80, 120].map((cx) => (
                      <g key={cx} className="mata">
                        <ellipse cx={cx} cy="88" rx={ekspresi === "kaget" ? 12 : 11} ry={ekspresi === "kaget" ? 15 : 13} fill={`url(#${u}-mata)`} />
                        <g className="kucing-pupil">
                          <ellipse cx={cx} cy="89" rx="5" ry={ekspresi === "kaget" ? 5 : 7} fill="#0b1633" opacity="0.85" />
                          <circle cx={cx + 4} cy="83" r="4.2" fill="#fff" />
                          <circle cx={cx - 3.5} cy="94" r="2" fill="#fff" opacity="0.85" />
                        </g>
                      </g>
                    ))}
                    {ekspresi === "sedih" && (
                      <>
                        <path d="M66 74 q 12 -6 22 -1 M134 74 q -12 -6 -22 -1" stroke={w.mata} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                        <ellipse cx="72" cy="104" rx="3" ry="4.5" fill="#8fd3ff" opacity="0.9">
                          <animate attributeName="cy" values="100;112;100" dur="1.6s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.9;0;0.9" dur="1.6s" repeatCount="indefinite" />
                        </ellipse>
                      </>
                    )}
                  </g>
                )}

                {/* mata tertutup bahagia: ^ ^ (ekspresi senang, dielus, menguap) */}
                <g className={`mata-senang ${ekspresi === "senang" ? "tampil" : ""}`} stroke={w.mata} strokeWidth="5" fill="none" strokeLinecap="round">
                  <path d="M69 90 q 11 -14 22 0" />
                  <path d="M109 90 q 11 -14 22 0" />
                </g>
                {ekspresi === "tidur" && (
                  <g stroke={w.mata} strokeWidth="4.5" fill="none" strokeLinecap="round">
                    <path d="M70 88 q 10 9 20 0" />
                    <path d="M110 88 q 10 9 20 0" />
                  </g>
                )}

                {/* hidung */}
                <path d="M93 102 Q 100 98 107 102 Q 104 109 100 110 Q 96 109 93 102 Z" fill={`url(#${u}-hidung)`} />
                <ellipse cx="98" cy="102.5" rx="2.4" ry="1.3" fill="#fff" opacity="0.8" />

                {/* mulut */}
                <g className="mulut-biasa">
                  {ekspresi === "sedih" ? (
                    <path d="M88 122 q 12 -8 24 0" stroke={w.mata} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  ) : ekspresi === "senang" ? (
                    <g>
                      <path d="M84 112 q 16 22 32 0 Z" fill="#c2325f" stroke={w.mata} strokeWidth="3" strokeLinejoin="round" />
                      <ellipse cx="100" cy="120" rx="8" ry="4" fill="#ff8fb1" />
                    </g>
                  ) : ekspresi === "kaget" ? (
                    <ellipse cx="100" cy="119" rx="6" ry="7" fill="#c2325f" stroke={w.mata} strokeWidth="2.5" />
                  ) : (
                    <path d="M100 110 q -8 10 -14 2 M100 110 q 8 10 14 2" stroke={w.mata} strokeWidth="3" fill="none" strokeLinecap="round" />
                  )}
                </g>
                {/* mulut menguap (hanya tampil saat kelas .menguap aktif) */}
                <g className="mulut-menguap">
                  <ellipse cx="100" cy="120" rx="10" ry="12" fill="#c2325f" stroke={w.mata} strokeWidth="2.5" />
                  <ellipse cx="100" cy="125" rx="6" ry="4" fill="#ff8fb1" />
                </g>

                {/* kumis */}
                <g stroke={garis} strokeWidth="2" strokeLinecap="round" opacity="0.7" className="kumis">
                  <path d="M48 98 q 12 -2 22 1 M50 110 q 10 -3 20 -3" fill="none" />
                  <path d="M152 98 q -12 -2 -22 1 M150 110 q -10 -3 -20 -3" fill="none" />
                </g>

                {/* kacamata */}
                <Kacamata id={dipakai.kacamata} u={u} />
              </g>

              {/* topi (ikut kepala, bukan wajah) */}
              <Topi id={dipakai.topi} u={u} />
            </g>

            {ekspresi === "tidur" && (
              <g fill="#3d6bff" fontFamily="var(--font-display)" fontWeight="700">
                <text x="150" y="44" fontSize="16">
                  z
                  <animate attributeName="y" values="48;30;48" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;0" dur="2.4s" repeatCount="indefinite" />
                </text>
                <text x="162" y="30" fontSize="22">
                  Z
                  <animate attributeName="y" values="34;12;34" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;0" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
      <div ref={wadahHati} className="pointer-events-none absolute inset-0 overflow-visible" />
    </div>
  );
}


/* =====================================================================
   Aksesori — dipakai oleh Kucing dan oleh IkonBarang (pratinjau di butik).
   ===================================================================== */

export function DefsAksesori({ u }) {
  return (
    <>
      <pattern id={`${u}-polka`} width="9" height="9" patternUnits="userSpaceOnUse">
        <rect width="9" height="9" fill="#ff7eb6" />
        <circle cx="2.2" cy="2.2" r="1.7" fill="#fff" />
        <circle cx="6.7" cy="6.7" r="1.7" fill="#fff" />
      </pattern>
      <pattern id={`${u}-polka-putih`} width="9" height="9" patternUnits="userSpaceOnUse">
        <rect width="9" height="9" fill="#fff4fa" />
        <circle cx="2.2" cy="2.2" r="1.6" fill="#ff7eb6" />
        <circle cx="6.7" cy="6.7" r="1.6" fill="#ff7eb6" />
      </pattern>
      <linearGradient id={`${u}-emas`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff3c4" />
        <stop offset="35%" stopColor="#ffd66b" />
        <stop offset="65%" stopColor="#f2b53a" />
        <stop offset="100%" stopColor="#c8841e" />
      </linearGradient>
      <radialGradient id={`${u}-kilap`} cx="30%" cy="25%" r="80%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
        <stop offset="60%" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </>
  );
}

export function Topi({ id, u }) {
  if (id === "topi-pesta")
    return (
      <g>
        <path d="M100 2 L125 48 L75 48 Z" fill="#ff8fc0" stroke="#e05f98" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M100 2 L112 25 L88 25 Z" fill={`url(#${u}-kilap)`} />
        <path d="M83 40 h34 M90 26 h20" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
        <circle cx="100" cy="4" r="7" fill={`url(#${u}-emas)`} />
      </g>
    );
  if (id === "topi-jerami")
    return (
      <g>
        <ellipse cx="100" cy="46" rx="64" ry="14" fill="#ffd66b" stroke="#d9a53a" strokeWidth="2.5" />
        <path d="M72 46 a 28 30 0 0 1 56 0 Z" fill="#ffe08a" stroke="#d9a53a" strokeWidth="2.5" />
        <path d="M72 44 q 28 10 56 0" stroke="#3d6bff" strokeWidth="6" fill="none" />
        <ellipse cx="88" cy="30" rx="10" ry="5" fill="#fff" opacity="0.5" />
      </g>
    );
  if (id === "mahkota")
    return (
      <g>
        <path d="M62 48 L68 12 L85 34 L100 4 L115 34 L132 12 L138 48 Z" fill={`url(#${u}-emas)`} stroke="#b8741a" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="100" cy="30" r="5.5" fill="#ff7eb6" stroke="#fff" strokeWidth="1.5" />
        <circle cx="76" cy="36" r="4" fill="#5fd6a4" stroke="#fff" strokeWidth="1.2" />
        <circle cx="124" cy="36" r="4" fill="#3d6bff" stroke="#fff" strokeWidth="1.2" />
        <path d="M70 18 L78 30" stroke="#fff" strokeWidth="2.5" opacity="0.7" strokeLinecap="round" />
      </g>
    );
  if (id === "pita-polkadot")
    return (
      <g transform="rotate(-12 128 40)">
        <path d="M128 40 C 104 18, 96 54, 128 44 Z" fill={`url(#${u}-polka)`} stroke="#e05f98" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M128 40 C 152 18, 160 54, 128 44 Z" fill={`url(#${u}-polka)`} stroke="#e05f98" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M126 44 l -8 20 M130 44 l 8 20" stroke="#e05f98" strokeWidth="5" strokeLinecap="round" />
        <circle cx="128" cy="42" r="6" fill="#ff7eb6" stroke="#e05f98" strokeWidth="2" />
        <circle cx="126" cy="40" r="2" fill="#fff" opacity="0.8" />
      </g>
    );
  if (id === "tiara-polkadot")
    return (
      <g>
        <path d="M66 46 Q 100 30 134 46 L 128 22 L 114 34 L 100 10 L 86 34 L 72 22 Z" fill={`url(#${u}-emas)`} stroke="#b8741a" strokeWidth="2.5" strokeLinejoin="round" />
        {[
          [100, 22, 6],
          [80, 33, 4],
          [120, 33, 4],
          [72, 24, 3],
          [128, 24, 3],
        ].map(([cx, cy, r]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r={r} fill={`url(#${u}-polka)`} stroke="#fff" strokeWidth="1.4" />
            <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.3} fill="#fff" />
          </g>
        ))}
      </g>
    );
  return null;
}

export function Kacamata({ id, u }) {
  if (id === "kacamata-bulat")
    return (
      <g stroke="#3d6bff" strokeWidth="3.5" fill="#cdeeff" fillOpacity="0.35">
        <circle cx="80" cy="88" r="16" />
        <circle cx="120" cy="88" r="16" />
        <path d="M96 88 h8" />
        <path d="M70 80 q 6 -5 12 -2" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.8" strokeLinecap="round" />
      </g>
    );
  if (id === "kacamata-hitam")
    return (
      <g>
        <rect x="59" y="77" width="36" height="22" rx="9" fill="#23324a" />
        <rect x="105" y="77" width="36" height="22" rx="9" fill="#23324a" />
        <path d="M95 86 h10" stroke="#23324a" strokeWidth="5" />
        <path d="M65 83 h12 M111 83 h12" stroke="#fff" strokeWidth="3" opacity="0.45" strokeLinecap="round" />
      </g>
    );
  if (id === "kacamata-hati") {
    const hati = (cx) =>
      `M${cx} 100 C ${cx - 22} 88, ${cx - 16} 70, ${cx} 80 C ${cx + 16} 70, ${cx + 22} 88, ${cx} 100 Z`;
    return (
      <g>
        <path d={hati(80)} fill={`url(#${u}-polka)`} fillOpacity="0.9" stroke="#e05f98" strokeWidth="3" strokeLinejoin="round" />
        <path d={hati(120)} fill={`url(#${u}-polka)`} fillOpacity="0.9" stroke="#e05f98" strokeWidth="3" strokeLinejoin="round" />
        <path d="M94 84 q 6 -4 12 0" stroke="#e05f98" strokeWidth="3" fill="none" />
        <path d="M70 80 q 4 -4 9 -2 M110 80 q 4 -4 9 -2" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return null;
}

export function Baju({ id, u }) {
  if (id === "baju-garis")
    return (
      <g>
        <path d="M60 136 A 42 42 0 0 0 140 136 L 140 168 A 46 46 0 0 1 60 168 Z" fill="#ff8fc0" />
        <path d="M58 148 h84 M58 159 h84" stroke="#fff" strokeWidth="5" opacity="0.9" />
        <path d="M60 136 A 42 42 0 0 0 140 136 L 140 146 A 46 46 0 0 1 60 146 Z" fill={`url(#${u}-kilap)`} />
      </g>
    );
  if (id === "baju-pelaut")
    return (
      <g>
        <path d="M60 136 A 42 42 0 0 0 140 136 L 140 170 A 46 46 0 0 1 60 170 Z" fill="#3d6bff" />
        <path d="M82 130 L100 152 L118 130 L108 126 L100 140 L92 126 Z" fill="#fff" />
        <circle cx="100" cy="160" r="4" fill={`url(#${u}-emas)`} />
        <path d="M60 136 A 42 42 0 0 0 140 136 L 140 146 A 46 46 0 0 1 60 146 Z" fill={`url(#${u}-kilap)`} />
      </g>
    );
  if (id === "gaun-polkadot")
    return (
      <g>
        {/* rok mengembang */}
        <path d="M62 138 Q 100 150 138 138 L 152 176 Q 100 192 48 176 Z" fill={`url(#${u}-polka)`} stroke="#e05f98" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M48 176 Q 100 192 152 176" stroke="#fff" strokeWidth="4" fill="none" strokeDasharray="1 7" strokeLinecap="round" />
        {/* kerah & pita kecil */}
        <path d="M78 130 Q 100 146 122 130 L 116 140 Q 100 150 84 140 Z" fill="#fff" stroke="#f5b7d3" strokeWidth="1.5" />
        <path d="M100 140 l -9 -6 v 12 Z M100 140 l 9 -6 v 12 Z" fill="#ff7eb6" />
        <circle cx="100" cy="140" r="3" fill={`url(#${u}-emas)`} />
        <path d="M66 146 Q 84 152 100 152" stroke="#fff" strokeWidth="4" opacity="0.5" fill="none" strokeLinecap="round" />
      </g>
    );
  return null;
}

export function Tas({ id, u }) {
  if (id === "tas-ransel")
    return (
      <g>
        <rect x="28" y="130" width="28" height="34" rx="10" fill="#5fd6a4" stroke="#2f9d70" strokeWidth="2.5" />
        <rect x="32" y="142" width="20" height="10" rx="4" fill="#fff" opacity="0.8" />
        <rect x="31" y="132" width="10" height="16" rx="5" fill="#fff" opacity="0.35" />
      </g>
    );
  if (id === "tas-bintang")
    return (
      <g>
        <rect x="28" y="132" width="28" height="30" rx="13" fill="#a98bff" stroke="#7b57e8" strokeWidth="2.5" />
        <path d="M42 139 l3 6 6.5 1 -4.8 4.5 1.2 6.5 -5.9 -3.2 -5.9 3.2 1.2 -6.5 -4.8 -4.5 6.5 -1 Z" fill={`url(#${u}-emas)`} />
      </g>
    );
  if (id === "tas-polkadot")
    return (
      <g>
        <path d="M32 138 q 10 -16 20 0" stroke={`url(#${u}-emas)`} strokeWidth="3.5" fill="none" />
        <path d="M26 140 h32 l -3 22 q -13 6 -26 0 Z" fill={`url(#${u}-polka)`} stroke="#e05f98" strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="36" y="144" width="12" height="5" rx="2.5" fill={`url(#${u}-emas)`} />
        <path d="M30 144 v 12" stroke="#fff" strokeWidth="3" opacity="0.5" strokeLinecap="round" />
      </g>
    );
  return null;
}

export function Sepatu({ id, u }) {
  if (id === "sepatu-polkadot")
    return (
      <g>
        {[78, 122].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy="182" rx="18" ry="10.5" fill={`url(#${u}-polka)`} stroke="#e05f98" strokeWidth="2.5" />
            <path d={`M${cx - 10} 177 h20`} stroke="#e05f98" strokeWidth="3" strokeLinecap="round" />
            <circle cx={cx} cy="177" r="2.8" fill={`url(#${u}-emas)`} />
            <ellipse cx={cx - 7} cy="179" rx="5" ry="2.5" fill="#fff" opacity="0.5" />
          </g>
        ))}
      </g>
    );
  const warna = id === "sepatu-bot" ? "#8a5a2b" : "#ff8a8a";
  return (
    <g>
      {[78, 122].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="182" rx="18" ry="10.5" fill={warna} />
          <path d={`M${cx - 14} 183 h28`} stroke="#fff" strokeWidth="3" opacity="0.75" />
          <ellipse cx={cx - 7} cy="178" rx="6" ry="2.8" fill="#fff" opacity="0.35" />
        </g>
      ))}
    </g>
  );
}

// Area gambar tiap slot di koordinat kucing (untuk memotong pratinjau barang).
const KOTAK_SLOT = {
  topi: "54 -4 96 70",
  kacamata: "54 64 92 44",
  baju: "44 122 112 72",
  tas: "20 124 44 44",
  sepatu: "54 166 92 30",
};

/** Pratinjau satu barang (dipakai di kartu butik). */
export function IkonBarang({ barang, ukuran = 80 }) {
  const u = `i${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const Komp = { topi: Topi, kacamata: Kacamata, baju: Baju, tas: Tas, sepatu: Sepatu }[barang.slot];
  return (
    <svg viewBox={KOTAK_SLOT[barang.slot]} width={ukuran} height={ukuran} aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <DefsAksesori u={u} />
      </defs>
      <Komp id={barang.id} u={u} />
    </svg>
  );
}
