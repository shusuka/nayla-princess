"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BARANG_BY_ID, KUCING_BY_ID, LEVELS, STIKER } from "./data";
import { bintangDari } from "./quiz";
import { bangunkanAudio, hentikanMusik, mulaiMusik, setPengaturanAudio } from "./sound";

const KUNCI_SIMPAN = "catmath-v1";

export function hariIni() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function kemarinDari(tgl) {
  const d = new Date(`${tgl}T00:00:00`);
  d.setDate(d.getDate() - 1);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function stateAwal() {
  return {
    versi: 1,
    namaAnak: "",
    levelTerakhir: null,
    ikan: 0,
    permata: 0,
    levels: Object.fromEntries(LEVELS.map((l) => [l.id, { bintang: 0, terbaik: 0, main: 0 }])),
    kucingTerbuka: ["mimi"],
    kucingAktif: "mimi",
    barangDimiliki: [],
    dipakai: { topi: null, kacamata: null, baju: null, tas: null, sepatu: null },
    stiker: [],
    stats: {
      totalSoal: 0,
      benar: 0,
      salah: 0,
      perFakta: {},
      streak: 0,
      hariTerakhir: "",
      detikPerHari: {},
      soalPerHari: {},
    },
    setelan: { suara: true, musik: true, mimi: true, suaraLama: false },
  };
}

function gabung(awal, tersimpan) {
  if (!tersimpan || typeof tersimpan !== "object") return awal;
  return {
    ...awal,
    ...tersimpan,
    levels: { ...awal.levels, ...(tersimpan.levels || {}) },
    dipakai: { ...awal.dipakai, ...(tersimpan.dipakai || {}) },
    stats: { ...awal.stats, ...(tersimpan.stats || {}) },
    setelan: { ...awal.setelan, ...(tersimpan.setelan || {}) },
    kucingTerbuka: tersimpan.kucingTerbuka?.length ? tersimpan.kucingTerbuka : awal.kucingTerbuka,
  };
}

const Ctx = createContext(null);

export function GameProvider({ children }) {
  const [state, setState] = useState(stateAwal);
  const [siap, setSiap] = useState(false);
  const [stikerBaru, setStikerBaru] = useState(null);
  const audioHidup = useRef(false);

  // Muat dari localStorage
  useEffect(() => {
    try {
      const mentah = localStorage.getItem(KUNCI_SIMPAN);
      // Sengaja dibaca setelah render pertama: kalau dibaca saat render, hasil di server
      // (kosong) dan di browser (ada isinya) berbeda sehingga hidrasi gagal.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (mentah) setState((s) => gabung(s, JSON.parse(mentah)));
    } catch {
      /* simpanan rusak, pakai state awal */
    }
    setSiap(true);
  }, []);

  // Simpan otomatis
  useEffect(() => {
    if (!siap) return;
    try {
      localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(state));
    } catch {
      /* penyimpanan penuh, abaikan */
    }
  }, [state, siap]);

  // Sinkronkan setelan audio
  useEffect(() => {
    setPengaturanAudio(state.setelan);
    if (audioHidup.current) {
      if (state.setelan.musik) mulaiMusik();
      else hentikanMusik();
    }
  }, [state.setelan]);

  // Hitung lama belajar hari ini (hanya saat tab aktif)
  useEffect(() => {
    if (!siap) return undefined;
    const t = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setState((s) => {
        const h = hariIni();
        return {
          ...s,
          stats: {
            ...s.stats,
            detikPerHari: { ...s.stats.detikPerHari, [h]: (s.stats.detikPerHari[h] || 0) + 10 },
          },
        };
      });
    }, 10000);
    return () => clearInterval(t);
  }, [siap]);

  const cekStiker = useCallback((s) => {
    const layak = STIKER.filter((st) => {
      try {
        return st.cek(s);
      } catch {
        return false;
      }
    }).map((st) => st.id);
    const baru = layak.filter((id) => !s.stiker.includes(id));
    if (!baru.length) return s;
    setTimeout(() => setStikerBaru(STIKER.find((st) => st.id === baru[0])), 400);
    return { ...s, stiker: [...s.stiker, ...baru] };
  }, []);

  const nyalakanAudio = useCallback(() => {
    // Sentuhan pertama: browser baru mengizinkan audio, jadi musik & klip Mimi disiapkan di sini.
    if (!audioHidup.current) bangunkanAudio();
    audioHidup.current = true;
  }, []);

  /**
   * Dicatat sekali per soal, setelah anak menemukan jawaban yang benar.
   * `benar` = benar pada percobaan pertama; bila false, anak berhasil setelah mencoba lagi
   * (dihitung sebagai "dengan bantuan" di statistik, tetap mendapat ikan).
   */
  const catatJawaban = useCallback(
    ({ kunci, benar, hadiahIkan = benar ? 2 : 1 }) => {
      setState((s) => {
        const h = hariIni();
        const stats = { ...s.stats };
        stats.perFakta = { ...stats.perFakta };
        const f = stats.perFakta[kunci] || { b: 0, s: 0 };
        stats.perFakta[kunci] = benar ? { ...f, b: f.b + 1 } : { ...f, s: f.s + 1 };
        stats.totalSoal += 1;
        if (benar) stats.benar += 1;
        else stats.salah += 1;
        stats.soalPerHari = { ...stats.soalPerHari, [h]: (stats.soalPerHari[h] || 0) + 1 };
        if (stats.hariTerakhir !== h) {
          stats.streak = stats.hariTerakhir === kemarinDari(h) ? stats.streak + 1 : 1;
          stats.hariTerakhir = h;
        }
        const baru = { ...s, stats, ikan: s.ikan + hadiahIkan };
        return cekStiker(baru);
      });
    },
    [cekStiker]
  );

  const selesaiLevel = useCallback(
    (idLevel, benar, total) => {
      const bintang = bintangDari(benar, total);
      setState((s) => {
        const lama = s.levels[idLevel] || { bintang: 0, terbaik: 0, main: 0 };
        const levels = {
          ...s.levels,
          [idLevel]: {
            bintang: Math.max(lama.bintang, bintang),
            terbaik: Math.max(lama.terbaik, benar),
            main: (lama.main || 0) + 1,
          },
        };
        const permataDapat = bintang >= 5 ? 3 : bintang >= 3 ? 2 : bintang > 0 ? 1 : 0;
        const baru = { ...s, levels, permata: s.permata + permataDapat, ikan: s.ikan + bintang * 3 };
        return cekStiker(baru);
      });
      return bintang;
    },
    [cekStiker]
  );

  const tambahIkan = useCallback((n) => setState((s) => ({ ...s, ikan: Math.max(0, s.ikan + n) })), []);

  const beliBarang = useCallback((id) => {
    setState((s) => {
      const b = BARANG_BY_ID[id];
      if (!b || s.barangDimiliki.includes(id) || s.ikan < b.harga) return s;
      return {
        ...s,
        ikan: s.ikan - b.harga,
        barangDimiliki: [...s.barangDimiliki, id],
        dipakai: { ...s.dipakai, [b.slot]: id },
      };
    });
  }, []);

  const pakaiBarang = useCallback((id) => {
    setState((s) => {
      const b = BARANG_BY_ID[id];
      if (!b || !s.barangDimiliki.includes(id)) return s;
      const sedangDipakai = s.dipakai[b.slot] === id;
      return { ...s, dipakai: { ...s.dipakai, [b.slot]: sedangDipakai ? null : id } };
    });
  }, []);

  const bukaKucing = useCallback(
    (id) => {
      setState((s) => {
        const k = KUCING_BY_ID[id];
        if (!k || s.kucingTerbuka.includes(id) || s.ikan < k.harga) return s;
        const baru = {
          ...s,
          ikan: s.ikan - k.harga,
          kucingTerbuka: [...s.kucingTerbuka, id],
          kucingAktif: id,
        };
        return cekStiker(baru);
      });
    },
    [cekStiker]
  );

  const pilihKucing = useCallback((id) => {
    setState((s) => (s.kucingTerbuka.includes(id) ? { ...s, kucingAktif: id } : s));
  }, []);

  const ubahSetelan = useCallback((patch) => {
    setState((s) => ({ ...s, setelan: { ...s.setelan, ...patch } }));
  }, []);

  const setNama = useCallback((nama) => setState((s) => ({ ...s, namaAnak: nama })), []);

  /** Dicatat saat level dibuka, untuk tombol "Lanjut belajar" di beranda. */
  const tandaiLevel = useCallback(
    (id) => setState((s) => (s.levelTerakhir === id ? s : { ...s, levelTerakhir: id })),
    []
  );

  // Tujuan tombol "Lanjut belajar": level terakhir bila belum selesai, kalau tidak
  // level terbuka pertama yang belum berbintang, kalau semua selesai: mode tantangan.
  const levelLanjut = useMemo(() => {
    const bintang = (id) => state.levels[id]?.bintang || 0;
    const terakhir = LEVELS.find((l) => l.id === state.levelTerakhir);
    if (terakhir && bintang(terakhir.id) === 0) return terakhir;
    return LEVELS.find((l) => bintang(l.id) === 0) || null;
  }, [state.levels, state.levelTerakhir]);

  const resetSemua = useCallback(() => {
    setState(stateAwal());
    try {
      localStorage.removeItem(KUNCI_SIMPAN);
    } catch {
      /* abaikan */
    }
  }, []);

  const levelTerbuka = useCallback(
    (idLevel) => {
      const i = LEVELS.findIndex((l) => l.id === idLevel);
      if (i <= 0) return true;
      return (state.levels[LEVELS[i - 1].id]?.bintang || 0) > 0;
    },
    [state.levels]
  );

  const semuaLevelSelesai = useMemo(
    () => LEVELS.every((l) => (state.levels[l.id]?.bintang || 0) > 0),
    [state.levels]
  );

  const nilai = useMemo(
    () => ({
      state,
      siap,
      stikerBaru,
      tutupStiker: () => setStikerBaru(null),
      nyalakanAudio,
      catatJawaban,
      selesaiLevel,
      tambahIkan,
      beliBarang,
      pakaiBarang,
      bukaKucing,
      pilihKucing,
      ubahSetelan,
      setNama,
      resetSemua,
      levelTerbuka,
      semuaLevelSelesai,
      tandaiLevel,
      levelLanjut,
    }),
    [
      state,
      siap,
      stikerBaru,
      nyalakanAudio,
      catatJawaban,
      selesaiLevel,
      tambahIkan,
      beliBarang,
      pakaiBarang,
      bukaKucing,
      pilihKucing,
      ubahSetelan,
      setNama,
      resetSemua,
      levelTerbuka,
      semuaLevelSelesai,
      tandaiLevel,
      levelLanjut,
    ]
  );

  return <Ctx.Provider value={nilai}>{children}</Ctx.Provider>;
}

export function useGame() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame harus dipakai di dalam GameProvider");
  return c;
}
