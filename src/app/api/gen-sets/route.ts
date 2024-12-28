import { getPokemonSetData } from "@/client/google-sheets-client";
import { getShowdownFormatFromSet } from "@/utils/pokemon";

export async function GET() {
  const sets = await getPokemonSetData();

  return new Response(
    Object.values(sets)
      .sort((a, b) => a.showdownName.localeCompare(b.showdownName))
      .map(getShowdownFormatFromSet)
      .join("\n\n")
  );
}
