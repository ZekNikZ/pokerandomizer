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

export interface PokemonSet {
  id: string;
  tier: number;
}
