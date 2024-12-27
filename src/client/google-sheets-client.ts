import { type PokemonSet } from "@/types/pokemon-types";
import { SP } from "next/dist/shared/lib/utils";





// TODO: EVAN: Build Google Sheets Integration

export async function getPokemonSetData(): Promise<Record<string, PokemonSet>> {
  // TODO: Actually fetch data from Google Sheets
  
    // Get request to Google Sheets API to get data for Pokemon Sets
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1aOdHsVPYuLqEKeDoFmxwJ1u0_d_H6RYZy7d32hUqfDw/values/Sets!A:Q?key=${process.env.API_KEY}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  
  // Parse response as JSON
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data = await response.json();

  // TODO: Transform data into PokemonSet, look at typedef for PokemonSet to see how to constuct this object
  
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const values = data.values as string[][];
  const rows = values.slice(1);
  const sets: PokemonSet[] = [];
  console.log(values);
/*
  const sets: PokemonSet[] = rows.map((row) => {
    const id = row[0];
    const showdownName = row[1];
    const tier = Number(row[2]);
    const item = row[3];
    const ability = row[4];
    const nature = row[5];
    const moves = row[6].split(",").map((move) => move.trim());
    const evs 

    return {
      id,
      showdownName,
      tier,
      item,
      ability,
      nature,
      moves,
      evs,
    };
  });
*/
  //console.log(sets);
  return Object.fromEntries(sets.map((set) => [set.id, set]));
}
