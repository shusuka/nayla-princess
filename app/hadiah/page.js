"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Latar from "@/components/Latar";
import Kucing, { IkonBarang } from "@/components/Kucing";
import { BarAtas, Gelembung, Ikon, KartuMiring, Konfeti, Modal, SinarPutar, Tombol } from "@/components/UI";
import { BARANG, KELAS_BARANG, KUCING, SLOT_NAMA, STIKER } from "@/lib/data";
import { bicara, sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

const TAB = [
  { id: "polkadot", label: "Polkadot", emoji: "🎀" },
  { id: "aksesori", label: "Aksesori", emoji: "👑" },
  { id: "kucing", label: "Kucing", emoji: "🐱" },
  { id: "stiker", label: "Stiker", emoji: "🏅" },
];

/* ---------------- Etalase: Mimi di panggung berputar ---------------- */
function Etalase({ kucingId, dipakai, pesan, mencoba }) {
  return (
    <div className="bingkai-emas relative mx-auto mt-2 w-full max-w-xl">
      <div className="relative overflow-hidden rounded-[27px]" style={{ background: "linear-gradient(180deg,#ffe3f1 0%,#ffd0e6 60%,#ffc1dd 100%)" }}>
        {/* latar polkadot bergerak */}
        <div className="polkadot polkadot-jalan absolute inset-0 opacity-70" style={{ "--dot": "rgba(255,255,255,.75)" }} />
        {/* tirai kiri-kanan */}
        <div className="absolute inset-y-0 left-0 w-10 sm:w-14" style={{ background: "repeating-linear-gradient(90deg,#e0568f 0 10px,#f27aac 10px 20px)", boxShadow: "inset -10px 0 16px rgba(0,0,0,.18)", borderBottomRightRadius: 40 }} />
        <div className="absolute inset-y-0 right-0 w-10 sm:w-14" style={{ background: "repeating-linear-gradient(90deg,#f27aac 0 10px,#e0568f 10px 20px)", boxShadow: "inset 10px 0 16px rgba(0,0,0,.18)", borderBottomLeftRadius: 40 }} />
        <div className="absolute inset-x-0 top-0 h-6" style={{ background: "repeating-radial-gradient(circle at 12px -4px,#e0568f 0 14px,transparent 15px)", backgroundSize: "24px 24px" }} />
        {/* lampu sorot */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-64 -translate-x-1/2" style={{ background: "linear-gradient(180deg,rgba(255,255,255,.75),rgba(255,255,255,0) 85%)", clipPath: "polygon(38% 0,62% 0,100% 100%,0 100%)" }} />

        <div className="relative flex flex-col-reverse items-center px-12 pb-5 pt-6 sm:flex-row sm:justify-center sm:gap-2 sm:pt-8">
          <div className="relative grid place-items-center">
            <SinarPutar ukuran={300} />
            <div className="relative z-10">
              <Kucing id={kucingId} dipakai={dipakai} ekspresi="senang" aksi="goyang" ukuran={180} />
            </div>
            {/* panggung berputar */}
            <div className="bingkai-emas relative -mt-8 h-10 w-52 !rounded-[50%]">
              <div className="h-full w-full rounded-[50%]" style={{ background: "linear-gradient(90deg,#fff,#ffe0ee,#fff,#ffd3e8,#fff)", backgroundSize: "200% 100%", animation: "foil-geser 3s linear infinite", boxShadow: "inset 0 -6px 10px rgba(176,48,109,.18)" }} />
            </div>
          </div>
          <div className="relative z-20 mb-1 sm:mb-16">
            <Gelembung>{pesan}</Gelembung>
            {mencoba && <p className="mt-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-[#b0306d]">Sedang mencoba</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Kartu barang ---------------- */
function KartuBarang({ b, punya, dipakai, ikan, onPilih, indeks }) {
  const kelas = KELAS_BARANG[b.kelas] || KELAS_BARANG.biasa;
  const kurang = Math.max(0, b.harga - ikan);
  const mewah = b.kelas !== "biasa";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 20, delay: indeks * 0.05 }}
    >
      <KartuMiring kuat={14}>
        <button
          type="button"
          onClick={onPilih}
          className="group relative block h-full w-full rounded-[30px] p-[3px] text-left transition-transform active:scale-[0.97]"
          style={{
            background: b.kelas === "istimewa" ? "var(--emas-gradien)" : `linear-gradient(145deg, ${kelas.warna}, ${kelas.warna2})`,
            boxShadow: dipakai
              ? `0 0 0 4px #fff, 0 0 0 8px #5fd6a4, 0 20px 36px -14px ${kelas.warna2}`
              : `0 20px 36px -16px ${kelas.warna2}`,
          }}
        >
          <div className="relative flex h-full flex-col items-center overflow-hidden rounded-[27px] bg-gradient-to-b from-white to-[#f4f7ff] px-2 pb-3 pt-3">
            {b.koleksi === "polkadot" && <div className="polkadot absolute inset-0 opacity-50" style={{ "--dot": "rgba(255,126,182,.18)" }} />}
            {mewah && <span className="foil" />}
            {/* lencana kelas */}
            <span
              className="relative z-10 self-start rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white"
              style={{ background: b.kelas === "istimewa" ? "linear-gradient(90deg,#f2b53a,#d9921f)" : kelas.warna2 }}
            >
              {kelas.nama}
            </span>
            {/* pratinjau di atas alas kecil */}
            <div className="relative mt-1 grid h-24 w-full place-items-center">
              <div className="absolute bottom-2 h-4 w-20 rounded-[50%] bg-[#1b3a6b]/10 blur-[2px]" />
              <div className="relative transition-transform duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-2 group-hover:scale-110" style={{ filter: punya ? "none" : "saturate(.9)" }}>
                <div className="anim-melayang" style={{ animationDelay: `${-indeks * 0.6}s` }}>
                  <IkonBarang barang={b} ukuran={84} />
                </div>
              </div>
            </div>
            <span className="relative z-10 text-center font-display text-base font-bold leading-tight text-tinta">{b.nama}</span>
            <span className="relative z-10 text-xs font-semibold text-tinta-lembut">{SLOT_NAMA[b.slot]}</span>
            <span
              className={`relative z-10 mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-sm font-bold ${
                dipakai ? "bg-mint text-white" : punya ? "bg-langit text-white" : "bg-[#fff4d6] text-emas-tua"
              }`}
              style={{ boxShadow: "inset 0 -2px 0 rgba(0,0,0,.08)" }}
            >
              {dipakai ? (
                <>
                  <Ikon nama="centang" ukuran={14} /> Dipakai
                </>
              ) : punya ? (
                "Pakai"
              ) : (
                <>
                  <Ikon nama="ikan" ukuran={18} />
                  <span className="angka">{b.harga}</span>
                </>
              )}
            </span>
            {!punya && kurang > 0 && (
              <div className="relative z-10 mt-2 w-4/5">
                <div className="h-1.5 overflow-hidden rounded-full bg-[#e6edfb]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#ffd66b] to-[#f2b53a]" style={{ width: `${Math.min(100, (ikan / b.harga) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>
        </button>
      </KartuMiring>
    </motion.div>
  );
}

/* ---------------- Kotak kado untuk animasi buka hadiah ---------------- */
function KotakKado({ terbuka }) {
  return (
    <svg viewBox="0 0 160 150" width="170" height="160" aria-hidden="true" style={{ overflow: "visible" }}>
      <defs>
        <pattern id="kado-polka" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#ff7eb6" />
          <circle cx="4" cy="4" r="3" fill="#fff" />
          <circle cx="12" cy="12" r="3" fill="#fff" />
        </pattern>
        <linearGradient id="kado-emas" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3c4" />
          <stop offset="50%" stopColor="#f2b53a" />
          <stop offset="100%" stopColor="#c8841e" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="146" rx="60" ry="6" fill="#1b3a6b" opacity="0.18" />
      {/* badan kotak */}
      <rect x="24" y="66" width="112" height="78" rx="10" fill="url(#kado-polka)" stroke="#d44d8c" strokeWidth="3" />
      <rect x="24" y="66" width="112" height="22" fill="#000" opacity="0.08" />
      <rect x="72" y="66" width="16" height="78" fill="url(#kado-emas)" />
      {/* tutup + pita */}
      <g
        style={{
          transformBox: "fill-box",
          transformOrigin: "50% 100%",
          transition: "transform .6s cubic-bezier(.34,1.56,.64,1)",
          transform: terbuka ? "translate(40px,-90px) rotate(28deg)" : "none",
        }}
      >
        <rect x="16" y="46" width="128" height="24" rx="8" fill="url(#kado-polka)" stroke="#d44d8c" strokeWidth="3" />
        <rect x="72" y="46" width="16" height="24" fill="url(#kado-emas)" />
        <path d="M80 46 C 56 14, 36 40, 80 46 Z M80 46 C 104 14, 124 40, 80 46 Z" fill="url(#kado-emas)" stroke="#b8741a" strokeWidth="2.5" />
        <circle cx="80" cy="44" r="7" fill="url(#kado-emas)" stroke="#b8741a" strokeWidth="2" />
      </g>
    </svg>
  );
}

function BukaKado({ hadiah, onSelesai, kucingAktif, dipakai }) {
  const [terbuka, setTerbuka] = useState(false);
  useEffect(() => {
    if (!hadiah) return undefined;
    sfx("gendang");
    const t1 = setTimeout(() => {
      setTerbuka(true);
      sfx("buka");
      bicara(hadiah.jenis === "kucing" ? "Asyik! Ada teman kucing baru!" : "Yeay! Kamu dapat hadiah baru!");
    }, 900);
    const t2 = setTimeout(() => sfx("kilau"), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [hadiah]);

  return (
    <Modal terbuka={!!hadiah} lebar="max-w-sm">
      {hadiah && (
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-emas-tua">{terbuka ? "Hadiah baru" : "Kado untukmu"}</p>
          <div className="relative mx-auto mt-2 grid h-56 place-items-center">
            {terbuka && <SinarPutar ukuran={340} />}
            <AnimatePresence mode="wait">
              {!terbuka ? (
                <motion.div
                  key="kado"
                  animate={{ rotate: [0, -6, 6, -8, 8, -4, 4, 0], scale: [1, 1.03, 1, 1.05, 1, 1.08, 1.02, 1.1] }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                  exit={{ scale: 1.3, opacity: 0 }}
                >
                  <KotakKado terbuka={false} />
                </motion.div>
              ) : (
                <motion.div
                  key="isi"
                  initial={{ scale: 0.2, y: 60, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  className="relative z-10"
                >
                  {hadiah.jenis === "kucing" ? (
                    <Kucing id={hadiah.data.id} ekspresi="senang" aksi="lambai" ukuran={180} />
                  ) : (
                    <Kucing id={kucingAktif} dipakai={dipakai} ekspresi="senang" aksi="tepuk" ukuran={180} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {terbuka && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h3 className="teks-emas text-3xl font-bold">{hadiah.data.nama}</h3>
                <p className="mt-1 text-tinta-lembut">
                  {hadiah.jenis === "kucing" ? `${hadiah.data.sifat}. Sekarang jadi temanmu!` : "Langsung dipakai. Cantik sekali!"}
                </p>
                <Tombol onClick={onSelesai} warna="#ff7eb6" bayangan="#d44d8c" suara="hati" className="mt-5 w-full px-6 py-3 text-xl">
                  Yeay! 💖
                </Tombol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Modal>
  );
}

/* ================================================================ */

export default function Hadiah() {
  const { state, beliBarang, pakaiBarang, bukaKucing, pilihKucing } = useGame();
  const [tab, setTab] = useState("polkadot");
  const [konfeti, setKonfeti] = useState(false);
  const [pesan, setPesan] = useState("Selamat datang di butikku!");
  const [coba, setCoba] = useState(null); // { slot: id } — pratinjau barang yang belum dibeli
  const [hadiah, setHadiah] = useState(null); // { jenis, data }
  const timerCoba = useRef(null);

  useEffect(() => () => clearTimeout(timerCoba.current), []);

  const dipakaiTampil = coba ? { ...state.dipakai, ...coba } : state.dipakai;

  const rayakan = (jenis, data) => {
    setHadiah({ jenis, data });
    setTimeout(() => {
      setKonfeti(true);
      setTimeout(() => setKonfeti(false), 3000);
    }, 900);
  };

  const beli = (b) => {
    clearTimeout(timerCoba.current);
    setCoba(null);
    if (state.barangDimiliki.includes(b.id)) {
      pakaiBarang(b.id);
      sfx(state.dipakai[b.slot] === b.id ? "wus" : "kilau");
      setPesan(state.dipakai[b.slot] === b.id ? `${b.nama} dilepas` : `Aku pakai ${b.nama}!`);
      return;
    }
    if (state.ikan < b.harga) {
      // belum cukup: boleh dicoba dulu sebentar
      sfx("boing");
      setCoba({ [b.slot]: b.id });
      setPesan(`Cantik ya? Kumpulkan ${b.harga - state.ikan} ikan lagi!`);
      timerCoba.current = setTimeout(() => {
        setCoba(null);
        setPesan("Ayo cari ikan lagi!");
      }, 3500);
      return;
    }
    beliBarang(b.id);
    setPesan(`Yeay, dapat ${b.nama}!`);
    rayakan("barang", b);
  };

  const ambilKucing = (k) => {
    if (state.kucingTerbuka.includes(k.id)) {
      pilihKucing(k.id);
      sfx("meong");
      setPesan(`Halo, aku ${k.nama}!`);
      return;
    }
    if (state.ikan < k.harga) {
      sfx("boing");
      setPesan(`Ikan belum cukup. Kurang ${k.harga - state.ikan}`);
      return;
    }
    bukaKucing(k.id);
    setPesan(`Kucing baru: ${k.nama}!`);
    rayakan("kucing", k);
  };

  const daftarBarang = BARANG.filter((b) => (tab === "polkadot" ? b.koleksi === "polkadot" : !b.koleksi));

  return (
    <main className="relative min-h-dvh pb-20">
      <Latar rumput={false} />
      <Konfeti aktif={konfeti} jumlah={90} />
      <BarAtas judul="Butik Mimi" />

      <div className="mx-auto max-w-3xl px-4">
        <Etalase kucingId={state.kucingAktif} dipakai={dipakaiTampil} pesan={pesan} mencoba={!!coba} />

        {/* tab dengan pil yang meluncur */}
        <div className="kaca mx-auto mt-5 flex w-full max-w-md justify-between gap-1 rounded-full p-1.5" role="tablist">
          {TAB.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => {
                setTab(t.id);
                sfx("gelembung");
              }}
              className={`relative flex-1 rounded-full px-2 py-2 font-display text-sm font-bold transition-colors sm:text-base ${tab === t.id ? "text-white" : "text-tinta"}`}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="pil-tab"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: t.id === "polkadot" ? "linear-gradient(135deg,#ff9cc8,#ff5fa2)" : "linear-gradient(135deg,#6e95ff,#3d6bff)",
                    boxShadow: "inset 0 2px 0 rgba(255,255,255,.5), 0 8px 16px -6px rgba(27,58,107,.4)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                />
              )}
              <span className="relative">
                {t.emoji} {t.label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-5"
          >
            {tab === "polkadot" && (
              <div className="relative mb-4 overflow-hidden rounded-[30px] p-5 text-white" style={{ background: "linear-gradient(135deg,#ff9cc8,#ff5fa2 60%,#e0468a)" }}>
                <div className="polkadot polkadot-jalan absolute inset-0" style={{ "--dot": "rgba(255,255,255,.25)" }} />
                <span className="foil" />
                <p className="relative text-xs font-bold uppercase tracking-[0.25em] opacity-90">Koleksi terbatas</p>
                <h2 className="relative mt-1 text-3xl font-extrabold leading-none drop-shadow-[0_3px_0_rgba(176,48,109,.6)]">Koleksi Polkadot</h2>
                <p className="relative mt-2 text-sm font-semibold opacity-95">
                  Pita, tiara, gaun, tas, sampai sepatu bertotol. Ada juga Dotty, kucing yang bulunya polkadot!
                </p>
              </div>
            )}

            {(tab === "aksesori" || tab === "polkadot") && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {daftarBarang.map((b, i) => (
                  <KartuBarang
                    key={b.id}
                    b={b}
                    indeks={i}
                    ikan={state.ikan}
                    punya={state.barangDimiliki.includes(b.id)}
                    dipakai={state.dipakai[b.slot] === b.id}
                    onPilih={() => beli(b)}
                  />
                ))}
              </div>
            )}

            {(tab === "kucing" || tab === "polkadot") && (
              <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 ${tab === "polkadot" ? "mt-4" : ""}`}>
                {KUCING.filter((k) => (tab === "polkadot" ? k.warna.totol : true)).map((k, i) => {
                  const punya = state.kucingTerbuka.includes(k.id);
                  const aktif = state.kucingAktif === k.id;
                  return (
                    <motion.div
                      key={k.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 20, delay: i * 0.06 }}
                    >
                      <KartuMiring kuat={12}>
                        <button
                          type="button"
                          onClick={() => ambilKucing(k)}
                          className="relative block h-full w-full rounded-[30px] p-[3px] transition-transform active:scale-[0.97]"
                          style={{
                            background: k.harga >= 300 ? "var(--emas-gradien)" : "linear-gradient(145deg,#8fb3ff,#3d6bff)",
                            boxShadow: aktif ? "0 0 0 4px #fff, 0 0 0 8px #5fd6a4" : "0 18px 34px -16px rgba(27,58,107,.5)",
                          }}
                        >
                          <div className="relative flex h-full flex-col items-center overflow-hidden rounded-[27px] bg-gradient-to-b from-white to-[#f1f5ff] p-2">
                            {k.warna.totol && <div className="polkadot absolute inset-0 opacity-50" style={{ "--dot": "rgba(255,126,182,.18)" }} />}
                            {k.harga >= 300 && <span className="foil" />}
                            <div className={`relative ${punya ? "" : "opacity-45 grayscale"}`}>
                              <Kucing id={k.id} ukuran={120} ekspresi={punya ? "senang" : "tidur"} bisaDielus={punya} />
                            </div>
                            {!punya && (
                              <span className="absolute right-3 top-3">
                                <Ikon nama="gembok" ukuran={26} />
                              </span>
                            )}
                            <span className="relative font-display text-lg font-bold text-tinta">{punya ? k.nama : "???"}</span>
                            <span className="relative px-1 text-center text-xs text-tinta-lembut">{k.sifat}</span>
                            <span
                              className={`relative mb-1 mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-sm font-bold ${
                                aktif ? "bg-mint text-white" : punya ? "bg-langit text-white" : "bg-[#fff4d6] text-emas-tua"
                              }`}
                            >
                              {aktif ? (
                                <>
                                  <Ikon nama="centang" ukuran={14} /> Dipilih
                                </>
                              ) : punya ? (
                                "Pilih"
                              ) : (
                                <>
                                  <Ikon nama="ikan" ukuran={18} /> <span className="angka">{k.harga}</span>
                                </>
                              )}
                            </span>
                          </div>
                        </button>
                      </KartuMiring>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {tab === "stiker" && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {STIKER.map((s, i) => {
                  const punya = state.stiker.includes(s.id);
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.04 }}
                      className={`kartu flex flex-col items-center gap-1 p-4 text-center ${punya ? "" : "opacity-60 grayscale"}`}
                    >
                      <div className={`grid h-20 w-20 place-items-center rounded-full ${punya ? "bingkai-emas !rounded-full" : "bg-[#e6edfb]"}`}>
                        <div className={`grid h-full w-full place-items-center rounded-full bg-gradient-to-b from-white to-[#fff4d6] text-4xl ${punya ? "anim-bobbing" : ""}`}>
                          {punya ? s.emoji : <Ikon nama="gembok" ukuran={30} />}
                        </div>
                      </div>
                      <span className="mt-1 font-display text-sm font-bold text-tinta">{s.nama}</span>
                      <span className="text-xs text-tinta-lembut">{s.desc}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </AnimatePresence>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Tombol href="/main" warna="#2fbf86" bayangan="#1f9064" className="px-6 py-4 text-lg">
            🎮 Cari ikan lagi
          </Tombol>
          <Tombol href="/belajar" warna="#3d6bff" bayangan="#2445c9" className="px-6 py-4 text-lg">
            📘 Belajar lagi
          </Tombol>
        </div>
      </div>

      <BukaKado key={hadiah?.data.id ?? "kosong"} hadiah={hadiah} onSelesai={() => setHadiah(null)} kucingAktif={state.kucingAktif} dipakai={state.dipakai} />
    </main>
  );
}
