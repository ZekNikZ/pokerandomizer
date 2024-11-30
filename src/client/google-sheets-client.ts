import { type PokemonSet } from "@/types/pokemon-types";

// TODO: EVAN: Build Google Sheets Integration

export async function getPokemonSetData(): Promise<Record<string, PokemonSet>> {
  // TODO: Actually fetch data from Google Sheets
  const data = [];

  // TODO: Transform data into PokemonSet, look at typedef for PokemonSet to see how to constuct this object
  const sets: PokemonSet[] = []; // = data.map((row) => ...);

  return Object.fromEntries(sets.map((set) => [set.id, set]));
}
