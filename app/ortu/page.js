"use client";

import { useMemo, useState } from "react";
import Latar from "@/components/Latar";
import { BarAtas, Bintang, Modal, Tombol } from "@/components/UI";
import { LEVELS } from "@/lib/data";
import { sfx } from "@/lib/sound";
import { hariIni, useGame } from "@/lib/store";

function menitDari(detik) {
  const m = Math.floor((detik || 0) / 60);
  const s = (detik || 0) % 60;
  return m > 0 ? `${m} mnt ${s} dtk` : `${s} dtk`;
}

function tanggalPendek(tgl) {
  const d = new Date(`${tgl}T00:00:00`);
  return d.toLocaleDateString("id-ID", { weekday: "short" });
}

function KotakAngka({ label, nilai, emoji, warna }) {
  return (
    <div className="kartu flex flex-col items-center px-3 py-4" style={{ borderColor: warna }}>
      <span className="text-3xl">{emoji}</span>
      <span className="mt-1 text-2xl font-bold text-laut-tua">{nilai}</span>
      <span className="text-center text-xs font-semibold text-laut-tua/70">{label}</span>
    </div>
  );
}

export default function HalamanOrtu() {
  const { state, ubahSetelan, resetSemua } = useGame();
  const [konfirmasi, setKonfirmasi] = useState(false);

  const h = hariIni();
  const stats = state.stats;
  const akurasi = stats.totalSoal ? Math.round((stats.benar / stats.totalSoal) * 100) : 0;
  const levelSelesai = LEVELS.filter((l) => (state.levels[l.id]?.bintang || 0) > 0).length;

  const tujuhHari = useMemo(() => {
    const daftar = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(`${h}T00:00:00`);
      d.setDate(d.getDate() - i);
      const p = (n) => String(n).padStart(2, "0");
      const tgl = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      daftar.push({ tgl, soal: stats.soalPerHari?.[tgl] || 0, detik: stats.detikPerHari?.[tgl] || 0 });
    }
    return daftar;
  }, [h, stats.soalPerHari, stats.detikPerHari]);

  const maksSoal = Math.max(1, ...tujuhHari.map((d) => d.soal));

  const sulit = useMemo(() => {
    return Object.entries(stats.perFakta || {})
      .map(([kunci, v]) => {
        const [jenis, a, b] = kunci.split(":");
        return {
          kunci,
          teks: jenis === "kali" ? `${a} × ${b}` : `${a} ÷ ${b}`,
          salah: v.s || 0,
          benar: v.b || 0,
        };
      })
      .filter((f) => f.salah > 0)
      .sort((x, y) => y.salah - x.salah || x.benar - y.benar)
      .slice(0, 8);
  }, [stats.perFakta]);

  return (
    <main className="relative min-h-dvh pb-16">
      <Latar rumput={false} />
      <BarAtas judul="Orang Tua" />

      <div className="mx-auto max-w-3xl px-4">
        <div className="kartu p-4">
          <h2 className="text-xl font-bold text-laut-tua">
            Laporan {state.namaAnak ? `belajar ${state.namaAnak}` : "belajar"}
          </h2>
          <p className="text-sm text-laut-tua/70">
            Data disimpan di perangkat ini saja (localStorage), tidak dikirim ke mana pun.
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KotakAngka emoji="⏱️" label="Belajar hari ini" nilai={menitDari(stats.detikPerHari?.[h])} warna="#4f8ef7" />
          <KotakAngka emoji="📝" label="Total soal" nilai={stats.totalSoal} warna="#b79cff" />
          <KotakAngka emoji="✅" label="Benar tanpa bantuan" nilai={stats.benar} warna="#7ee8b2" />
          <KotakAngka emoji="💪" label="Berhasil setelah mencoba lagi" nilai={stats.salah} warna="#ffb27a" />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KotakAngka emoji="🎯" label="Ketepatan" nilai={`${akurasi}%`} warna="#ffd86e" />
          <KotakAngka emoji="🏁" label="Level selesai" nilai={`${levelSelesai}/${LEVELS.length}`} warna="#4f8ef7" />
          <KotakAngka emoji="🔥" label="Hari berturut-turut" nilai={stats.streak} warna="#ffb067" />
          <KotakAngka emoji="🐟" label="Ikan terkumpul" nilai={state.ikan} warna="#6ec6ff" />
        </div>

        {/* grafik 7 hari */}
        <div className="kartu mt-4 p-4">
          <h3 className="mb-3 text-lg font-bold text-laut-tua">Soal dikerjakan 7 hari terakhir</h3>
          <div className="flex h-36 items-end justify-between gap-2">
            {tujuhHari.map((d) => (
              <div key={d.tgl} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold text-laut-tua">{d.soal || ""}</span>
                <div
                  className="w-full rounded-t-lg bg-laut transition-all"
                  style={{ height: `${(d.soal / maksSoal) * 100}%`, minHeight: d.soal ? 6 : 3, opacity: d.soal ? 1 : 0.25 }}
                />
                <span className="text-[11px] font-semibold text-laut-tua/70">{tanggalPendek(d.tgl)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* progres level */}
        <div className="kartu mt-4 p-4">
          <h3 className="mb-3 text-lg font-bold text-laut-tua">Perkembangan per level</h3>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {LEVELS.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-2 rounded-xl bg-awan px-3 py-1.5">
                <span className="text-sm font-semibold text-laut-tua">{l.nama}</span>
                <Bintang jumlah={state.levels[l.id]?.bintang || 0} ukuran={13} />
              </div>
            ))}
          </div>
        </div>

        {/* materi sulit */}
        <div className="kartu mt-4 p-4">
          <h3 className="mb-2 text-lg font-bold text-laut-tua">Yang masih sering keliru</h3>
          {sulit.length === 0 ? (
            <p className="text-laut-tua/70">Belum ada. Bagus sekali! 🎉</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sulit.map((f) => (
                <span
                  key={f.kunci}
                  className="rounded-full bg-merah/25 px-3 py-1.5 text-sm font-bold text-laut-tua"
                  title={`Salah ${f.salah}x, benar ${f.benar}x`}
                >
                  {f.teks} · ❌{f.salah}
                </span>
              ))}
            </div>
          )}
          <p className="mt-2 text-sm text-laut-tua/70">
            Tips: ulangi level yang memuat angka di atas, lalu gunakan tombol 💡 Bantu aku agar anak melihat
            kelompok bendanya.
          </p>
        </div>

        {/* pengaturan */}
        <div className="kartu mt-4 p-4">
          <h3 className="mb-3 text-lg font-bold text-laut-tua">Pengaturan</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { k: "suara", label: "Efek suara", emoji: "🔔" },
              { k: "musik", label: "Musik latar", emoji: "🎵" },
              { k: "mimi", label: "Suara Mimi", emoji: "🐱" },
            ].map((s) => (
              <button
                key={s.k}
                type="button"
                onClick={() => {
                  ubahSetelan({ [s.k]: !state.setelan[s.k] });
                  sfx("pilih");
                }}
                className="flex items-center justify-between rounded-2xl bg-awan px-4 py-3 font-semibold text-laut-tua"
              >
                <span>
                  {s.emoji} {s.label}
                </span>
                <span className={`rounded-full px-3 py-1 text-sm text-white ${state.setelan[s.k] ? "bg-mint" : "bg-slate-400"}`}>
                  {state.setelan[s.k] ? "Nyala" : "Mati"}
                </span>
              </button>
            ))}
          </div>
          <Tombol
            warna="#ff8a8a"
            bayangan="#d95f5f"
            className="mt-4 w-full px-6 py-3 text-lg"
            onClick={() => setKonfirmasi(true)}
          >
            🗑️ Hapus semua data & mulai dari awal
          </Tombol>
        </div>
      </div>

      <Modal terbuka={konfirmasi}>
        <h3 className="text-2xl font-bold text-laut-tua">Hapus semua data?</h3>
        <p className="mt-2 text-laut-tua/70">
          Semua bintang, ikan, kucing, dan riwayat belajar akan hilang. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Tombol warna="#c9d6e6" bayangan="#a9b8cd" className="px-6 py-3 text-lg" onClick={() => setKonfirmasi(false)}>
            Batal
          </Tombol>
          <Tombol
            warna="#ff8a8a"
            bayangan="#d95f5f"
            className="px-6 py-3 text-lg"
            onClick={() => {
              resetSemua();
              setKonfirmasi(false);
            }}
          >
            Ya, hapus
          </Tombol>
        </div>
      </Modal>
    </main>
  );
}
