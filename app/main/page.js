"use client";

import Latar from "@/components/Latar";
import Kucing from "@/components/Kucing";
import { BarAtas, Gelembung, KartuMenu } from "@/components/UI";
import { GAME_LIST } from "@/lib/data";
import { useGame } from "@/lib/store";

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

        <div className="mt-4 grid gap-3">
          {GAME_LIST.map((g) => (
            <KartuMenu
              key={g.id}
              href={`/main/${g.id}`}
              emoji={g.emoji}
              judul={g.nama}
              sub={g.desc}
              warna={g.warna}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-sm font-semibold text-laut-tua/70">
          Setiap jawaban benar dapat 🐟 ikan untuk membeli hadiah!
        </p>
      </div>
    </main>
  );
}
