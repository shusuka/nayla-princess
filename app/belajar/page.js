"use client";

import Link from "next/link";
import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { BarAtas, Bintang, Gelembung, Ikon, KartuMiring, Tombol } from "@/components/UI";
import { LEVELS } from "@/lib/data";
import { sfx } from "@/lib/sound";
import { useGame } from "@/lib/store";

function KartuLevel({ level, data, terkunci, indeks, sekarang }) {
  const { nyalakanAudio } = useGame();
  const bintang = data?.bintang || 0;

  const isi = (
    <KartuMiring kuat={14}>
      <div
        className={`kartu anim-muncul relative flex flex-col items-center gap-1.5 px-2 pb-3 pt-4 transition-transform duration-300 ${
          terkunci ? "opacity-70 grayscale" : "hover:-translate-y-1.5"
        } ${sekarang ? "ring-4 ring-[#ffd66b]" : ""}`}
        style={{ animationDelay: `${Math.min(indeks, 12) * 0.05}s` }}
      >
        {sekarang && (
          <span className="anim-bobbing absolute -top-4 rounded-full bg-gradient-to-b from-[#fff1b8] to-[#ffd66b] px-2.5 py-0.5 font-display text-xs font-bold text-emas-tua shadow">
            Main di sini!
          </span>
        )}
        <span
          className={`polkadot grid h-16 w-16 place-items-center rounded-full font-display text-3xl font-extrabold text-white ${sekarang ? "anim-denyut" : ""}`}
          style={{
            backgroundColor: terkunci ? "#b8c6de" : level.warna,
            "--dot": "rgba(255,255,255,.2)",
            boxShadow: "inset 0 4px 0 rgba(255,255,255,.5), inset 0 -6px 10px rgba(0,0,0,.15), 0 10px 18px -8px rgba(27,58,107,.5)",
            textShadow: "0 2px 0 rgba(0,0,0,.18)",
          }}
        >
          {terkunci ? <Ikon nama="gembok" ukuran={30} /> : level.angka}
        </span>
        <span className="font-display text-sm font-bold text-tinta">
          {level.jenis === "kali" ? "Perkalian" : "Pembagian"}
        </span>
        <Bintang jumlah={bintang} ukuran={14} />
      </div>
    </KartuMiring>
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
  // level berikutnya yang belum dimainkan diberi sorotan
  const sekarangId = LEVELS.find((l) => levelTerbuka(l.id) && !(state.levels[l.id]?.bintang > 0))?.id;
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
        <div className="mt-3 grid w-full grid-cols-3 gap-x-3 gap-y-6 pt-3 sm:grid-cols-5">
          {kali.map((l, i) => (
            <KartuLevel
              key={l.id}
              level={l}
              indeks={i}
              data={state.levels[l.id]}
              terkunci={!levelTerbuka(l.id)}
              sekarang={l.id === sekarangId}
            />
          ))}
        </div>

        <h2 className="judul-tebal mt-8 self-start text-2xl font-bold">➗ Pembagian</h2>
        <div className="mt-3 grid w-full grid-cols-3 gap-x-3 gap-y-6 pt-3 sm:grid-cols-5">
          {bagi.map((l, i) => (
            <KartuLevel
              key={l.id}
              level={l}
              indeks={i}
              data={state.levels[l.id]}
              terkunci={!levelTerbuka(l.id)}
              sekarang={l.id === sekarangId}
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
