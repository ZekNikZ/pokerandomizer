export type PokemonTypeName =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

export interface PokemonType {
  id: number;
  name: PokemonTypeName;
}

export interface Pokemon {
  id: string;
  name: string;
  types: PokemonType[];
  sprite: string;
  cry: string;
}

export const evStats = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"] as const;

export type EVStats = (typeof evStats)[number];

export interface PokemonSet {
  // Pokemon ID (e.g., "pikachu") - use the function in utils/pokemon.ts for this
  id: string;
  // Pokemon Showdown Name (e.g., "Zygarde-10%") - use the function in utils/pokemon.ts for this
  showdownName: string;
  // Nickname
  nickname?: string;
  // Tier (e.g., 1, 2, 3, 4)
  tier: number;
  // Held item name (e.g., "Choice Scarf")
  item: string;
  // Ability name (e.g., "Adaptability")
  ability: string;
  // Nature (e.g., "Hardy")
  nature: string;
  // Moves (e.g., ["Swords Dance", ...])
  moves: string[];
  // EVs (e.g., { HP: 80, Atk: 74, SpD: 23 })
  evs: Partial<Record<EVStats, number>>;
  // Tera Type (e.g., "Grass")
  teraType: string;
}
