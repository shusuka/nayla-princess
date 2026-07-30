import GameMain from "@/components/GameMain";
import { GAME_BY_ID, GAME_LIST } from "@/lib/data";

export function generateStaticParams() {
  return GAME_LIST.map((g) => ({ game: g.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { game } = await params;
  return { title: `${GAME_BY_ID[game]?.nama || "Bermain"} — CatMath Adventure` };
}

export default async function Page({ params }) {
  const { game } = await params;
  return <GameMain game={game} />;
}
