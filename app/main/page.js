"use client";

import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { Ikan, Makanan, Tikus } from "@/components/Hewan";
import { BarAtas, Gelembung, KartuMenu } from "@/components/UI";
import { GAME_LIST } from "@/lib/data";
import { useGame } from "@/lib/store";

// Gambar 3D untuk tiap kartu game (yang tidak ada di sini memakai emoji).
const GAMBAR = {
  ikan: <Ikan warna="#ffd13b" ukuran={70} senang />,
  makan: <Makanan ukuran={62} />,
  tikus: <Tikus ukuran={66} senang />,
};

export default function MenuGame() {
  const { state } = useGame();

  return (
    <main className="relative min-h-dvh pb-14">
      <Latar rumput={false} />
      <BarAtas judul="Bermain" />

      <div className="mx-auto max-w-2xl px-4">
        <div className="flex items-end justify-center">
          <Kucing id={state.kucingAktif} dipakai={state.dipakai} ekspresi="senang" aksi="goyang" ukuran={120} />
          <Gelembung className="mb-6">Mau main yang mana?</Gelembung>
        </div>

        <div className="mt-4 grid gap-4">
          {GAME_LIST.map((g, i) => (
            <KartuMenu
              key={g.id}
              href={`/main/${g.id}`}
              emoji={g.emoji}
              judul={g.nama}
              sub={g.desc}
              warna={g.warna}
              gambar={GAMBAR[g.id]}
              indeks={i}
            />
          ))}
        </div>

        <p className="kaca mx-auto mt-6 w-fit rounded-full px-4 py-2 text-center text-sm font-semibold text-tinta">
          Setiap jawaban benar dapat 🐟 ikan untuk membeli hadiah!
        </p>
      </div>
    </main>
  );
}
