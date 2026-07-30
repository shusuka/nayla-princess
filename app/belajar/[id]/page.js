import LevelMain from "@/components/LevelMain";
import { LEVELS, LEVEL_BY_ID } from "@/lib/data";

export function generateStaticParams() {
  return [...LEVELS.map((l) => ({ id: l.id })), { id: "tantangan" }];
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const nama = id === "tantangan" ? "Mode Tantangan" : LEVEL_BY_ID[id]?.nama || "Belajar";
  return { title: `${nama} — CatMath Adventure` };
}

export default async function Page({ params }) {
  const { id } = await params;
  return <LevelMain id={id} />;
}
