"use client";

import Link from "next/link";
import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { BarAtas, Bintang, Gelembung, Tombol } from "@/components/UI";
import { LEVELS } from "@/lib/data";
import { sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

function KartuLevel({ level, data, terkunci, indeks }) {
  const { nyalakanAudio } = useGame();
  const bintang = data?.bintang || 0;

  const isi = (
    <div
      className={`kartu anim-muncul relative flex flex-col items-center gap-1 px-3 py-4 transition-transform ${
        terkunci ? "opacity-70 grayscale" : "hover:-translate-y-1.5 hover:shadow-2xl"
      }`}
      style={{ animationDelay: `${Math.min(indeks, 12) * 0.04}s`, borderColor: level.warna }}
    >
      <span
        className="grid h-14 w-14 place-items-center rounded-full text-2xl font-bold text-white shadow-inner"
        style={{ background: level.warna }}
      >
        {terkunci ? "🔒" : level.angka}
      </span>
      <span className="text-sm font-bold text-laut-tua">
        {level.jenis === "kali" ? "Perkalian" : "Pembagian"}
      </span>
      <Bintang jumlah={bintang} ukuran={13} />
    </div>
  );

  if (terkunci) return <div>{isi}</div>;
  return (
    <Link
      href={`/belajar/${level.id}`}
      onClick={() => {
        nyalakanAudio();
        sfx("tap");
      }}
    >
      {isi}
    </Link>
  );
}

export default function PetaBelajar() {
  const { state, levelTerbuka, semuaLevelSelesai } = useGame();

  const kali = LEVELS.filter((l) => l.jenis === "kali");
  const bagi = LEVELS.filter((l) => l.jenis === "bagi");
  const totalBintang = LEVELS.reduce((n, l) => n + (state.levels[l.id]?.bintang || 0), 0);

  return (
    <main className="relative min-h-dvh pb-14">
      <Latar rumput={false} />
      <BarAtas judul="Belajar" />

      <div className="mx-auto flex max-w-4xl flex-col items-center px-4">
        <div className="flex items-end gap-3">
          <Kucing id={state.kucingAktif} dipakai={state.dipakai} ekspresi="senang" ukuran={120} />
          <Gelembung className="mb-6">
            Pilih level ya! Kamu punya {totalBintang} ⭐
          </Gelembung>
        </div>

        <h2 className="judul-tebal mt-2 self-start text-2xl font-bold">✖️ Perkalian</h2>
        <div className="mt-3 grid w-full grid-cols-3 gap-3 sm:grid-cols-5">
          {kali.map((l, i) => (
            <KartuLevel
              key={l.id}
              level={l}
              indeks={i}
              data={state.levels[l.id]}
              terkunci={!levelTerbuka(l.id)}
            />
          ))}
        </div>

        <h2 className="judul-tebal mt-8 self-start text-2xl font-bold">➗ Pembagian</h2>
        <div className="mt-3 grid w-full grid-cols-3 gap-3 sm:grid-cols-5">
          {bagi.map((l, i) => (
            <KartuLevel
              key={l.id}
              level={l}
              indeks={i}
              data={state.levels[l.id]}
              terkunci={!levelTerbuka(l.id)}
            />
          ))}
        </div>

        <div className="mt-8 w-full">
          {semuaLevelSelesai ? (
            <Tombol
              href="/belajar/tantangan"
              warna="#a07bf5"
              bayangan="#7a55d0"
              className="w-full px-6 py-5 text-xl"
            >
              🏆 Mode Tantangan — soal campur 1–10!
            </Tombol>
          ) : (
            <div className="kartu p-4 text-center text-laut-tua/80">
              🔒 Selesaikan semua level untuk membuka <b>Mode Tantangan</b>.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
