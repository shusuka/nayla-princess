"use client";

import { useEffect, useId, useRef } from "react";
import { KUCING_BY_ID } from "@/lib/data";
import { hentikanDengkur, mulaiDengkur, sfx } from "@/lib/sound";
import { campur, daftarkanPelacak } from "@/lib/gerak";

// Bentuk dasar kucing chibi (koordinat 200x200). Dipakai juga sebagai clip-path totol.
const KEPALA_D =
  "M100 38 C 133 38 155 58 156 86 C 157 99 154 108 150 114 L 157 118 C 152 122 147 125 142 126 " +
  "L 146 131 C 132 139 116 141 100 141 C 84 141 68 139 54 131 L 58 126 C 53 125 48 122 43 118 " +
  "L 50 114 C 46 108 43 99 44 86 C 45 58 67 38 100 38 Z";
const BADAN_D =
  "M100 114 C 129 114 147 132 150 157 C 153 174 141 188 120 189 L 80 189 C 59 188 47 174 50 157 C 53 132 71 114 100 114 Z";
const TELINGA_KIRI_D = "M54 72 C 46 52 43 32 49 17 C 52 11 59 12 64 16 C 75 25 85 35 92 45 Z";
const TELINGA_KIRI_DALAM_D = "M59 62 C 55 48 54 35 57 26 C 66 32 74 40 81 47 Z";
const cermin = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, x, y) => `${200 - Number(x)} ${y}`);
const TELINGA_KANAN_D = cermin(TELINGA_KIRI_D);
const TELINGA_KANAN_DALAM_D = cermin(TELINGA_KIRI_DALAM_D);

const EKOR = [
  "M144 176 C 176 180 190 152 176 128 C 170 118 176 106 186 110",
  "M144 176 C 182 172 194 140 172 120 C 164 112 168 100 178 100",
  "M144 176 C 172 186 196 160 184 134 C 178 122 186 112 194 118",
];
const EKOR_NILAI = [EKOR[0], EKOR[1], EKOR[0], EKOR[2], EKOR[0]].join("; ");

/**
 * Kucing chibi "3D": kepala besar bulat seperti mochi, mata berkilau besar,
 * shading volumetrik + cahaya tepi (fresnel), dan gerak idle berlapis
 * (kepala mengayun, telinga bergoyang, ekor melengkung, badan bernapas)
 * sehingga tidak terlihat kaku. Mata & kepala mengikuti jari/kursor,
 * kedip / kedut telinga / tertawa / menguap acak, bisa dielus (mendengkur + hati).
 *
 * ekspresi: diam | senang | sedih | kaget | tidur
 * aksi: none | lompat | goyang | putar | lambai | tepuk
 * bicara: true saat Mimi sedang berbicara (mulut bergerak)
 */
export default function Kucing({
  id = "mimi",
  ekspresi = "diam",
  aksi = "none",
  ukuran = 180,
  dipakai = {},
  className = "",
  bisaDielus = true,
  bicara = false,
}) {
  const k = KUCING_BY_ID[id] || KUCING_BY_ID.mimi;
  const w = k.warna;
  const u = `k${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const akar = useRef(null);
  const wadahHati = useRef(null);

  // Warna turunan untuk shading 3D
  const terang = campur(w.bulu, "#ffffff", 0.8);
  const tengah = w.bulu;
  const gelap = campur(w.bulu2, w.garis, 0.6);
  const garis = campur(w.garis, "#1b3a6b", 0.22);
  const tepi = campur(w.bulu2, "#9fd8ff", 0.55); // cahaya tepi kebiruan dari langit

  // Pelacak mata/kepala + perilaku acak (kedip, telinga, tertawa, menguap) tanpa render ulang React.
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
      const tunggu = 1500 + Math.random() * 3000;
      timers.push(
        setTimeout(() => {
          const r = Math.random();
          if (r < 0.5) {
            kelasSebentar("kedip", 150);
            if (Math.random() < 0.35) timers.push(setTimeout(() => kelasSebentar("kedip", 130), 250));
          } else if (r < 0.7) {
            kelasSebentar(Math.random() < 0.5 ? "kedut-kiri" : "kedut-kanan", 460);
          } else if (r < 0.82) {
            kelasSebentar("kibas", 800);
          } else if (r < 0.93) {
            kelasSebentar("tertawa", 1100);
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
          : "anim-napas-kucing";

  const mataBuka = ekspresi !== "tidur";
  const kaget = ekspresi === "kaget";
  const sedih = ekspresi === "sedih";
  const senang = ekspresi === "senang";
  const bulu = `url(#${u}-badan)`;
  const kulitTepi = { stroke: garis, strokeOpacity: 0.35, strokeWidth: 2 };

  return (
    <div
      ref={akar}
      className={`kucing-3d relative inline-block ${bicara ? "bicara" : ""} ${className}`}
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
      <div className={`h-full w-full ${kelasAksi}`} style={{ transformOrigin: "50% 92%" }}>
        <div className="kucing-miring h-full w-full">
          <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" style={{ overflow: "visible" }}>
            <defs>
              <radialGradient id={`${u}-badan`} cx="36%" cy="24%" r="85%">
                <stop offset="0%" stopColor={terang} />
                <stop offset="42%" stopColor={tengah} />
                <stop offset="100%" stopColor={gelap} />
              </radialGradient>
              {/* cahaya tepi (fresnel): tengah bening, pinggir berpendar → kesan bulat 3D */}
              <radialGradient id={`${u}-tepi`} cx="44%" cy="40%" r="62%">
                <stop offset="72%" stopColor={tepi} stopOpacity="0" />
                <stop offset="100%" stopColor={tepi} stopOpacity="0.75" />
              </radialGradient>
              {/* bayangan bawah (ambient occlusion) */}
              <linearGradient id={`${u}-ao`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="55%" stopColor={gelap} stopOpacity="0" />
                <stop offset="100%" stopColor={campur(gelap, "#1b3a6b", 0.35)} stopOpacity="0.55" />
              </linearGradient>
              <radialGradient id={`${u}-dada`} cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="100%" stopColor={terang} stopOpacity="0.6" />
              </radialGradient>
              <radialGradient id={`${u}-moncong`} cx="50%" cy="38%" r="62%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                <stop offset="100%" stopColor={terang} stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`${u}-telinga`} cx="50%" cy="78%" r="80%">
                <stop offset="0%" stopColor={campur(w.telinga, "#ffffff", 0.45)} />
                <stop offset="70%" stopColor={w.telinga} />
                <stop offset="100%" stopColor={campur(w.telinga, "#c2327a", 0.3)} />
              </radialGradient>
              <linearGradient id={`${u}-iris`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={campur(w.mata, "#0b1633", 0.55)} />
                <stop offset="45%" stopColor={w.mata} />
                <stop offset="100%" stopColor={campur(w.mata, "#bff0ff", 0.6)} />
              </linearGradient>
              <radialGradient id={`${u}-pipi`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff6fa8" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#ff6fa8" stopOpacity="0" />
              </radialGradient>
              <linearGradient id={`${u}-hidung`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffc2d8" />
                <stop offset="100%" stopColor="#ee5b8c" />
              </linearGradient>
              <radialGradient id={`${u}-kaki`} cx="45%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor={terang} />
                <stop offset="100%" stopColor={gelap} />
              </radialGradient>
              <filter id={`${u}-lembut`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
              <filter id={`${u}-kabur`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.6" />
              </filter>
              <clipPath id={`${u}-klip-kepala`}>
                <path d={KEPALA_D} />
              </clipPath>
              <clipPath id={`${u}-klip-badan`}>
                <path d={BADAN_D} />
              </clipPath>
              <DefsAksesori u={u} />
            </defs>

            {/* bayangan tanah: ikut "bernapas" */}
            <ellipse cx="100" cy="191" rx="52" ry="8" fill="#1b3a6b" opacity="0.24" filter={`url(#${u}-lembut)`} className="kucing-bayangan" />

            {/* ekor melengkung, mengayun pelan seperti pegas */}
            <g className="kucing-ekor">
              <path d={EKOR[0]} stroke={gelap} strokeWidth="17" strokeLinecap="round" fill="none">
                <animate attributeName="d" dur="3.6s" repeatCount="indefinite" values={EKOR_NILAI}
                  calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1" />
              </path>
              <path d={EKOR[0]} stroke={tengah} strokeWidth="11" strokeLinecap="round" fill="none">
                <animate attributeName="d" dur="3.6s" repeatCount="indefinite" values={EKOR_NILAI}
                  calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1" />
              </path>
              <path d={EKOR[0]} stroke={terang} strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" strokeDasharray="0 60 40 200">
                <animate attributeName="d" dur="3.6s" repeatCount="indefinite" values={EKOR_NILAI}
                  calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1" />
              </path>
            </g>

            {/* ======== BADAN (duduk, bentuk buah pir) ======== */}
            <g className="kucing-badan">
              <path d={BADAN_D} fill={bulu} {...kulitTepi} />
              {/* paha belakang */}
              <ellipse cx="66" cy="172" rx="19" ry="16" fill={bulu} opacity="0.9" />
              <ellipse cx="134" cy="172" rx="19" ry="16" fill={bulu} opacity="0.9" />
              <path d="M54 162 q 10 -8 22 -2 M146 162 q -10 -8 -22 -2" stroke={garis} strokeOpacity="0.25" strokeWidth="2" fill="none" strokeLinecap="round" />
              {w.totol && (
                <g clipPath={`url(#${u}-klip-badan)`} fill={w.totol} opacity="0.8">
                  <circle cx="62" cy="140" r="8" />
                  <circle cx="138" cy="146" r="9" />
                  <circle cx="70" cy="176" r="6" />
                  <circle cx="132" cy="178" r="7" />
                </g>
              )}
              {/* bulu dada yang mengembang */}
              <path
                d="M80 124 q 20 -7 40 0 q 6 16 -3 30 q -5 4 -8 -1 q -3 7 -9 7 q -6 0 -9 -7 q -3 5 -8 1 q -9 -14 -3 -30 Z"
                fill={`url(#${u}-dada)`}
              />
              <path d={BADAN_D} fill={`url(#${u}-ao)`} />
              <path d={BADAN_D} fill={`url(#${u}-tepi)`} />
            </g>
            {/* bayangan kepala jatuh ke badan */}
            <ellipse cx="100" cy="132" rx="38" ry="9" fill={gelap} opacity="0.4" filter={`url(#${u}-lembut)`} />

            {/* baju */}
            <Baju id={dipakai.baju} u={u} />

            {/* tas di punggung */}
            <Tas id={dipakai.tas} u={u} />

            {/* kaki depan / sepatu */}
            {dipakai.sepatu ? (
              <Sepatu id={dipakai.sepatu} u={u} />
            ) : (
              <g className="kucing-kaki">
                {[82, 118].map((cx) => (
                  <g key={cx}>
                    <ellipse cx={cx} cy="182" rx="14" ry="10" fill={`url(#${u}-kaki)`} {...kulitTepi} />
                    <path d={`M${cx - 5} 186 v-4 M${cx} 187 v-5 M${cx + 5} 186 v-4`} stroke={garis} strokeOpacity="0.35" strokeWidth="1.6" strokeLinecap="round" />
                    <ellipse cx={cx - 4} cy="178" rx="5" ry="2.4" fill="#fff" opacity="0.7" />
                  </g>
                ))}
              </g>
            )}

            {/* tangan kiri */}
            <g>
              {aksi === "tepuk" && (
                <animateTransform attributeName="transform" type="rotate" values="0 62 138; -25 62 138; 0 62 138" dur="0.5s" repeatCount="indefinite" />
              )}
              <ellipse cx="60" cy="150" rx="12" ry="14" fill={bulu} {...kulitTepi} transform="rotate(18 60 150)" />
              <ellipse cx="57" cy="158" rx="6" ry="4" fill="#fff" opacity="0.55" />
            </g>

            {/* tangan kanan (melambai) */}
            <g>
              {(aksi === "lambai" || aksi === "tepuk") && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  values={aksi === "lambai" ? "0 138 138; -38 138 138; 6 138 138; 0 138 138" : "0 138 138; 25 138 138; 0 138 138"}
                  keyTimes={aksi === "lambai" ? "0; 0.35; 0.7; 1" : "0; 0.5; 1"}
                  calcMode="spline"
                  keySplines={aksi === "lambai" ? "0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1" : "0.4 0 0.2 1; 0.4 0 0.2 1"}
                  dur={aksi === "lambai" ? "1.2s" : "0.5s"}
                  repeatCount="indefinite"
                />
              )}
              <ellipse cx="140" cy="150" rx="12" ry="14" fill={bulu} {...kulitTepi} transform="rotate(-18 140 150)" />
              <ellipse cx="143" cy="158" rx="6" ry="4" fill="#fff" opacity="0.55" />
            </g>

            {/* ======== KEPALA ======== */}
            <g className="kucing-kepala">
              <g className="kepala-ayun">
                {/* telinga */}
                <g className="telinga-kiri">
                  <path d={TELINGA_KIRI_D} fill={bulu} {...kulitTepi} strokeLinejoin="round" />
                  <path d={TELINGA_KIRI_DALAM_D} fill={`url(#${u}-telinga)`} />
                  <path d="M61 50 q 4 -6 9 -4 M64 56 q 4 -5 9 -3" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                </g>
                <g className="telinga-kanan">
                  <path d={TELINGA_KANAN_D} fill={bulu} {...kulitTepi} strokeLinejoin="round" />
                  <path d={TELINGA_KANAN_DALAM_D} fill={`url(#${u}-telinga)`} />
                  <path d="M139 50 q -4 -6 -9 -4 M136 56 q -4 -5 -9 -3" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                </g>

                {/* kepala mochi dengan jumbai pipi */}
                <path d={KEPALA_D} fill={bulu} {...kulitTepi} strokeWidth="2.4" strokeLinejoin="round" />
                {w.totol && (
                  <g clipPath={`url(#${u}-klip-kepala)`} fill={w.totol} opacity="0.8">
                    <circle cx="66" cy="60" r="9" />
                    <circle cx="138" cy="68" r="7" />
                    <circle cx="56" cy="118" r="5" />
                    <circle cx="146" cy="114" r="6" />
                  </g>
                )}
                <path d={KEPALA_D} fill={`url(#${u}-tepi)`} />
                {/* jambul kecil di puncak kepala */}
                <path d="M96 40 C 94 30 102 26 106 31 C 102 30 100 34 103 39" fill={tengah} stroke={garis} strokeOpacity="0.35" strokeWidth="1.6" strokeLinejoin="round" />
                {/* kilap di dahi */}
                <ellipse cx="80" cy="56" rx="19" ry="9" fill="#ffffff" opacity="0.6" transform="rotate(-22 80 56)" filter={`url(#${u}-kabur)`} />
                <ellipse cx="124" cy="50" rx="6" ry="3" fill="#ffffff" opacity="0.45" transform="rotate(18 124 50)" />

                {/* ---- wajah (bergeser lebih jauh → kesan menoleh 3D) ---- */}
                <g className="kucing-wajah">
                  {/* moncong */}
                  <ellipse cx="100" cy="114" rx="27" ry="17" fill={`url(#${u}-moncong)`} />

                  {/* pipi merona + garis malu */}
                  <g className="kucing-pipi">
                    <ellipse cx="60" cy="112" rx="15" ry="9" fill={`url(#${u}-pipi)`} />
                    <ellipse cx="140" cy="112" rx="15" ry="9" fill={`url(#${u}-pipi)`} />
                    <path d="M55 111 l3 -4 M61 112 l3 -4 M136 112 l3 -4 M142 111 l3 -4" stroke="#ff6fa8" strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
                  </g>

                  {/* mata besar berkilau */}
                  {mataBuka && (
                    <g className="mata-buka">
                      {[78, 122].map((cx) => {
                        const kiri = cx < 100;
                        const rx = kaget ? 12 : 13.5;
                        const ry = kaget ? 13 : 16;
                        return (
                          <g key={cx} className="mata">
                            <ellipse cx={cx} cy="92" rx={rx + 1.6} ry={ry + 1.6} fill={campur(w.mata, "#0b1633", 0.6)} />
                            <ellipse cx={cx} cy="92" rx={rx} ry={ry} fill={`url(#${u}-iris)`} />
                            <g className="kucing-pupil">
                              <ellipse cx={cx} cy="93" rx={kaget ? 4 : 6.5} ry={kaget ? 4.5 : 9} fill="#0b1633" opacity="0.9" />
                              <ellipse className="kilau-mata" cx={cx + (kiri ? 5 : 4)} cy="85" rx="5" ry="5.6" fill="#fff" />
                              <circle cx={cx - 4.5} cy="99" r="2.3" fill="#fff" opacity="0.9" />
                              <path d={`M${cx - 7} 103 q 7 4 14 0`} stroke="#fff" strokeOpacity="0.45" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                            </g>
                            {/* bulu mata lentik di sudut luar */}
                            <path
                              d={kiri ? `M${cx - 12} 82 q -5 -3 -7 -8 M${cx - 13} 87 q -6 -1 -9 -5` : `M${cx + 12} 82 q 5 -3 7 -8 M${cx + 13} 87 q 6 -1 9 -5`}
                              stroke={campur(w.mata, "#0b1633", 0.6)}
                              strokeWidth="2.4"
                              fill="none"
                              strokeLinecap="round"
                            />
                            {/* kelopak bawah tersenyum saat senang */}
                            {senang && (
                              <path d={`M${cx - 14} 104 q 14 -9 28 0 L ${cx + 16} 110 L ${cx - 16} 110 Z`} fill={campur(tengah, terang, 0.4)} />
                            )}
                          </g>
                        );
                      })}
                      {sedih && (
                        <>
                          <path d="M64 74 q 12 -7 24 -1 M136 74 q -12 -7 -24 -1" stroke={campur(w.mata, "#0b1633", 0.4)} strokeWidth="3.5" fill="none" strokeLinecap="round" />
                          <ellipse cx="70" cy="108" rx="3" ry="4.5" fill="#8fd3ff" opacity="0.9">
                            <animate attributeName="cy" values="104;118;104" dur="1.6s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.9;0;0.9" dur="1.6s" repeatCount="indefinite" />
                          </ellipse>
                        </>
                      )}
                    </g>
                  )}

                  {/* mata tertawa ^ ^ (dielus, menguap, tertawa) */}
                  <g className="mata-senang" stroke={campur(w.mata, "#0b1633", 0.5)} strokeWidth="5" fill="none" strokeLinecap="round">
                    <path d="M66 94 q 12 -15 24 0" />
                    <path d="M110 94 q 12 -15 24 0" />
                  </g>
                  {ekspresi === "tidur" && (
                    <g stroke={campur(w.mata, "#0b1633", 0.5)} strokeWidth="4.5" fill="none" strokeLinecap="round">
                      <path d="M67 92 q 11 9 22 0" />
                      <path d="M111 92 q 11 9 22 0" />
                    </g>
                  )}

                  {/* hidung */}
                  <path d="M94 106 Q 100 102 106 106 Q 103 112 100 113 Q 97 112 94 106 Z" fill={`url(#${u}-hidung)`} />
                  <ellipse cx="98.5" cy="106.3" rx="2.2" ry="1.2" fill="#fff" opacity="0.85" />

                  {/* mulut */}
                  <g className="mulut-biasa">
                    {sedih ? (
                      <path d="M90 124 q 10 -7 20 0" stroke={garis} strokeWidth="3" fill="none" strokeLinecap="round" />
                    ) : senang ? (
                      <g>
                        <path d="M86 115 q 14 20 28 0 q -14 5 -28 0 Z" fill="#c2325f" stroke={garis} strokeWidth="2.4" strokeLinejoin="round" />
                        <ellipse cx="100" cy="122" rx="7" ry="3.6" fill="#ff8fb1" />
                      </g>
                    ) : kaget ? (
                      <ellipse cx="100" cy="122" rx="5.5" ry="6.5" fill="#c2325f" stroke={garis} strokeWidth="2.2" />
                    ) : (
                      <path d="M88 115 q 6 7 12 0 q 6 7 12 0" stroke={garis} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </g>
                  {/* mulut bicara (bergerak saat Mimi berbicara) */}
                  <g className="mulut-bicara">
                    <ellipse cx="100" cy="120" rx="8" ry="7" fill="#c2325f" stroke={garis} strokeWidth="2.2" />
                    <ellipse cx="100" cy="124" rx="5" ry="2.6" fill="#ff8fb1" />
                  </g>
                  {/* mulut menguap */}
                  <g className="mulut-menguap">
                    <ellipse cx="100" cy="122" rx="10" ry="12" fill="#c2325f" stroke={garis} strokeWidth="2.4" />
                    <ellipse cx="100" cy="127" rx="6" ry="4" fill="#ff8fb1" />
                  </g>

                  {/* kumis */}
                  <g stroke={garis} strokeWidth="1.7" strokeLinecap="round" opacity="0.55" className="kumis" fill="none">
                    <path d="M46 104 q 12 -1 22 3 M45 114 q 11 -3 22 -2 M49 123 q 9 -5 19 -6" />
                    <path d="M154 104 q -12 -1 -22 3 M155 114 q -11 -3 -22 -2 M151 123 q -9 -5 -19 -6" />
                  </g>

                  {/* kacamata */}
                  <Kacamata id={dipakai.kacamata} u={u} />
                </g>

                {/* topi (ikut kepala, bukan wajah) */}
                <Topi id={dipakai.topi} u={u} />
              </g>
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
