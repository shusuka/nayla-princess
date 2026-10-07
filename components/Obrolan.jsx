"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import Kucing from "@/components/Kucing";
import { Ikon } from "@/components/UI";
import { FAKTA, SIMPUL, TEBAKAN, TEKS_OBROLAN } from "@/lib/obrolan";
import { bicaraKlip, dengarBicara, sedangBicara, sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

const PEGAS = { type: "spring", stiffness: 260, damping: 22 };

/** true selama Mimi sedang berbicara (mulut kucing ikut bergerak). */
export function useMimiBicara() {
  return useSyncExternalStore(dengarBicara, sedangBicara, () => false);
}

// titik mulai acak (sekali per muat halaman) supaya tebakan & cerita tidak selalu sama
const AWAL_TEBAK = Math.floor(Math.random() * TEBAKAN.length);
const AWAL_FAKTA = Math.floor(Math.random() * FAKTA.length);

let nomorPesan = 0;
const pesanBaru = (dari, teks, ekstra = {}) => ({ kunci: ++nomorPesan, dari, teks, ...ekstra });

function TitikMengetik() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={PEGAS}
      className="flex w-fit items-center gap-1.5 rounded-[22px] rounded-bl-md bg-white px-4 py-3.5 shadow-[0_10px_24px_-14px_rgb(27_58_107/.45)]"
      aria-label="Mimi sedang mengetik"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-2.5 w-2.5 rounded-full bg-laut/60"
          style={{ animation: `bobbing 0.9s ease-in-out ${i * 0.15}s infinite` }}
        />
      ))}
    </motion.div>
  );
}

function Balon({ pesan }) {
  const mimi = pesan.dari === "mimi";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: mimi ? -24 : 24, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={PEGAS}
      className={`flex ${mimi ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`relative max-w-[85%] px-4 py-2.5 font-display text-[1.05rem] font-semibold leading-snug sm:text-lg ${
          mimi
            ? "rounded-[22px] rounded-bl-md bg-white text-tinta shadow-[0_10px_24px_-14px_rgb(27_58_107/.45)]"
            : "rounded-[22px] rounded-br-md bg-laut text-white shadow-[inset_0_-3px_0_rgb(0_0_0/.12),0_10px_22px_-14px_rgb(36_69_201/.8)]"
        }`}
      >
        {pesan.teks}
        {pesan.hadiah && (
          <span className="ml-2 inline-flex translate-y-0.5 items-center gap-1 rounded-full bg-[#fff3c4] px-2 py-0.5 text-sm text-[#a86a10]">
            +1 <Ikon nama="ikan" ukuran={16} />
          </span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Panel obrolan dengan Mimi (bottom sheet). Anak memilih jawaban berupa tombol besar,
 * Mimi membalas dengan suara + teks. `onSuasana` memberi tahu halaman induk ekspresi
 * Mimi saat ini supaya kucing besar di panggung ikut bereaksi.
 */
export default function Obrolan({ terbuka, onTutup, onSuasana }) {
  const router = useRouter();
  const { state, nyalakanAudio, tambahIkan } = useGame();
  const bicara = useMimiBicara();
  const [pesan, setPesan] = useState([]);
  const [pilihan, setPilihan] = useState([]);
  const [mengetik, setMengetik] = useState(false);
  const [ekspresi, setEkspresi] = useState("senang");
  const gulir = useRef(null);
  const timers = useRef([]);
  const urutTebak = useRef(AWAL_TEBAK);
  const urutFakta = useRef(AWAL_FAKTA);
  const sudahTebak = useRef(false);
  const sudahFakta = useRef(false);
  const tebakan = useRef(null);
  const sudahMulai = useRef(false);

  const tunda = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const hapusTimer = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const ubahEkspresi = (e) => {
    setEkspresi(e);
    onSuasana?.(e);
  };

  /** Mimi "mengetik" sebentar, lalu kalimatnya muncul dan dibacakan, lalu pilihan muncul. */
  const mimiBilang = (ids, pilihanBerikut, { ekspresiMimi = "senang", teksAwal, hadiah = false } = {}) => {
    hapusTimer();
    setPilihan([]);
    setMengetik(true);
    tunda(async () => {
      setMengetik(false);
      ubahEkspresi(ekspresiMimi);
      const baris = ids.map((id, i) => {
        const teks = TEKS_OBROLAN[id] || id;
        return pesanBaru("mimi", i === 0 && teksAwal ? teksAwal(teks) : teks, { hadiah: hadiah && i === 0 });
      });
      setPesan((p) => [...p, ...baris]);
      sfx("gelembung");
      const lama = await bicaraKlip(ids, ids.map((id) => TEKS_OBROLAN[id]).join(" "));
      // pilihan muncul saat Mimi hampir selesai bicara (maks 2,6 dtk), supaya terasa bergiliran
      tunda(() => setPilihan(pilihanBerikut), Math.min(2600, Math.max(450, lama * 1000 - 600)));
    }, 650);
  };

  const keSimpul = (nama) => {
    const s = SIMPUL[nama];
    mimiBilang(s.mimi, s.pilihan, {
      ekspresiMimi: s.ekspresi || "senang",
      teksAwal: nama === "mulai" && state.namaAnak ? (t) => t.replace("Hai!", `Hai, ${state.namaAnak}!`) : undefined,
    });
    if (s.peluk) tunda(() => sfx("hati"), 900);
  };

  const mulaiTebak = () => {
    const t = TEBAKAN[urutTebak.current % TEBAKAN.length];
    urutTebak.current++;
    tebakan.current = t;
    const ids = sudahTebak.current ? [t.tanya.id] : ["obr-tebak-mulai", t.tanya.id];
    sudahTebak.current = true;
    mimiBilang(
      ids,
      t.pilihan.map((p) => ({ label: p.label, jawab: true, benar: Boolean(p.benar) })),
      { ekspresiMimi: "diam" }
    );
  };

  const ceritaFakta = () => {
    const f = FAKTA[urutFakta.current % FAKTA.length];
    urutFakta.current++;
    const ids = sudahFakta.current ? [f.id] : ["obr-fakta-mulai", f.id];
    sudahFakta.current = true;
    mimiBilang(ids, [
      { label: "Cerita lagi!", ikon: "buku", aksi: "fakta" },
      { label: "Wah, keren!", ikon: "bintang", ke: "lagi" },
    ]);
  };

  const pilih = (p) => {
    nyalakanAudio();
    setPilihan([]);
    if (p.jawab) {
      const t = tebakan.current;
      setPesan((m) => [...m, pesanBaru("anak", p.label)]);
      sfx(p.benar ? "benar" : "salah");
      if (p.benar) tambahIkan(1);
      const lanjut = [
        { label: "Tebak lagi!", ikon: "tanya", aksi: "tebak" },
        { label: "Ngobrol lagi", ikon: "obrolan", ke: "lagi" },
      ];
      tunda(() => {
        mimiBilang(p.benar ? ["obr-betul", t.jelas.id] : ["obr-hampir", t.jelas.id], lanjut, {
          ekspresiMimi: p.benar ? "senang" : "diam",
          hadiah: p.benar,
        });
      }, 250);
      return;
    }
    sfx("pilih");
    setPesan((m) => [...m, pesanBaru("anak", p.label)]);
    if (p.ke) return keSimpul(p.ke);
    if (p.aksi === "tebak") return mulaiTebak();
    if (p.aksi === "fakta") return ceritaFakta();
    if (p.aksi === "belajar" || p.aksi === "main") {
      tunda(() => router.push(p.aksi === "belajar" ? "/belajar" : "/main"), 350);
      return;
    }
    if (p.aksi === "tutup") onTutup?.();
  };

  // Mulai percakapan setiap panel dibuka (sapaan baru, riwayat lama tetap terlihat).
  useEffect(() => {
    if (!terbuka) {
      sudahMulai.current = false;
      return undefined;
    }
    if (sudahMulai.current) return undefined;
    sudahMulai.current = true;
    const t = setTimeout(() => keSimpul(pesan.length ? "lagi" : "mulai"), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terbuka]);

  useEffect(() => () => hapusTimer(), []);

  // gulir otomatis ke pesan terbaru
  useEffect(() => {
    const el = gulir.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [pesan, mengetik, pilihan]);

  const tutup = () => {
    hapusTimer();
    setPilihan([]);
    setMengetik(false);
    onTutup?.();
  };

  return (
    <AnimatePresence>
      {terbuka && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.button
            type="button"
            aria-label="Tutup obrolan"
            className="absolute inset-0 bg-laut-tua/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={tutup}
          />
          <motion.section
            role="dialog"
            aria-label="Ngobrol dengan Mimi"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 210, damping: 26 }}
            className="relative flex max-h-[min(78dvh,640px)] w-full max-w-xl flex-col overflow-hidden rounded-t-[2.5rem] border border-white/90 bg-[#eef6ff]/95 shadow-[0_-24px_60px_-20px_rgb(27_58_107/.45),inset_0_1px_0_rgb(255_255_255/.9)] backdrop-blur-xl"
          >
            {/* pegangan */}
            <span className="mx-auto mt-2.5 block h-1.5 w-12 rounded-full bg-laut-tua/15" aria-hidden="true" />

            {/* kepala panel */}
            <header className="flex items-center gap-3 px-5 pb-2 pt-1">
              <div className="-my-3 -ml-2 shrink-0">
                <Kucing id={state.kucingAktif} dipakai={state.dipakai} ekspresi={ekspresi} bicara={bicara} ukuran={74} bisaDielus={false} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-bold leading-tight text-tinta">Mimi</h2>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-tinta-lembut">
                  <span className={`block h-2 w-2 rounded-full ${bicara ? "bg-[#ff7eb6] anim-denyut" : "bg-mint"}`} />
                  {bicara ? "sedang bicara..." : mengetik ? "sedang mengetik..." : "mendengarkan kamu"}
                </p>
              </div>
              <button
                type="button"
                onClick={tutup}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-tinta shadow-[0_6px_14px_-8px_rgb(27_58_107/.5)] transition-transform active:scale-90"
                aria-label="Tutup obrolan"
              >
                <Ikon nama="tutup" ukuran={20} />
              </button>
            </header>

            {/* riwayat obrolan */}
            <div ref={gulir} className="flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 pb-3 pt-1" aria-live="polite">
              {pesan.map((m) => (
                <Balon key={m.kunci} pesan={m} />
              ))}
              <AnimatePresence>{mengetik && <TitikMengetik key="ketik" />}</AnimatePresence>
            </div>

            {/* pilihan jawaban anak */}
            <div className="min-h-[5.5rem] border-t border-white/80 bg-white/55 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <AnimatePresence mode="popLayout">
                {pilihan.length > 0 ? (
                  <motion.div
                    key={pilihan.map((p) => p.label).join("|")}
                    className={`grid gap-2.5 ${pilihan.length === 3 && pilihan[0].jawab ? "grid-cols-3" : "grid-cols-2"}`}
                    initial="awal"
                    animate="tampil"
                    exit={{ opacity: 0, y: 10, transition: { duration: 0.15 } }}
                    variants={{ tampil: { transition: { staggerChildren: 0.06 } } }}
                  >
                    {pilihan.map((p) => (
                      <motion.button
                        key={p.label}
                        type="button"
                        onClick={() => pilih(p)}
                        variants={{ awal: { opacity: 0, y: 18, scale: 0.9 }, tampil: { opacity: 1, y: 0, scale: 1 } }}
                        transition={PEGAS}
                        whileTap={{ scale: 0.95, y: 2 }}
                        className={`flex min-h-[3.25rem] items-center ${p.ikon ? "justify-start text-left" : "justify-center"} gap-2 rounded-[20px] bg-white px-3 py-2.5 font-display font-bold text-laut-tua shadow-[inset_0_-4px_0_rgb(61_107_255/.14),0_8px_18px_-12px_rgb(27_58_107/.6)] ${
                          p.jawab ? "text-2xl" : "text-base sm:text-lg"
                        }`}
                      >
                        {p.ikon && (
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-langit/60 text-laut">
                            <Ikon nama={p.ikon} ukuran={18} />
                          </span>
                        )}
                        <span className="leading-tight">{p.label}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.p
                    key="tunggu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid h-[3.25rem] place-items-center text-sm font-semibold text-tinta-lembut"
                  >
                    Dengarkan Mimi dulu ya...
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
