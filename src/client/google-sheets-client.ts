import { type PokemonSet } from "@/types/pokemon-types";
import { getPokemonIdFromName, getShowdownNameFromName } from "@/utils/pokemon";
import { unstable_cache } from "next/cache";

export const getPokemonSetData = unstable_cache(
  async function (): Promise<Record<string, PokemonSet>> {
    console.log("Fetching pokemon sets");
    // Get request to Google Sheets API to get data for Pokemon Sets
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/1aOdHsVPYuLqEKeDoFmxwJ1u0_d_H6RYZy7d32hUqfDw/values/Sets!A:R?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // cache: "force-cache",
        // next: {
        //   revalidate: 300,
        // },
      }
    );

    // Parse response as JSON
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    // Transform data into PokemonSet, look at typedef for PokemonSet to see how to constuct this object
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const values = data.values as string[][];
    const rows = values.slice(1);

    const sets: PokemonSet[] = rows.map((row) => {
      const id = row[17] ?? getPokemonIdFromName(row[0] ?? "");
      const showdownName = getShowdownNameFromName(row[0] ?? "");
      const tier = Number(row[1]);
      const item = row[2] ?? "";
      const ability = row[3] ?? "";
      const nickname = row[4];
      const nature = row[5] ?? "";
      const moves = [row[6] ?? "", row[7] ?? "", row[8] ?? "", row[9] ?? ""];
      const evs = {
        HP: row[10] ? Number(row[10]) : undefined,
        Atk: row[11] ? Number(row[11]) : undefined,
        Def: row[12] ? Number(row[12]) : undefined,
        SpA: row[13] ? Number(row[13]) : undefined,
        SpD: row[14] ? Number(row[14]) : undefined,
        Spe: row[15] ? Number(row[15]) : undefined,
      };
      const teraType = row[16] ?? "";

      return {
        id,
        showdownName,
        tier,
        item,
        ability,
        nickname,
        nature,
        moves,
        evs,
        teraType,
      };
    });

    return Object.fromEntries(sets.map((set) => [set.id, set]));
  },

  ["pokemon-sets"],
  { revalidate: 300, tags: ["pokemon-sets"] }
);
