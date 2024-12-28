import { type PokemonSet } from "@/types/pokemon-types";
import { stripIndentation } from "./strings";

export function getPokemonIdFromName(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("'", "")
    .replaceAll("(", "")
    .replaceAll(")", "");
}

export function getShowdownNameFromName(name: string): string {
  return name.replaceAll(" ", "-").replaceAll("(", "").replaceAll(")", "");
}

export function getShowdownFormatFromSet(pokemon: PokemonSet): string {
  return stripIndentation(`
    ${pokemon.nickname && pokemon.nickname.length > 0 ? pokemon.nickname : pokemon.showdownName} (${pokemon.showdownName}) @ ${pokemon.item}
    Ability: ${pokemon.ability}
    Tera Type: ${pokemon.teraType}
    Level: 100
    EVs: ${Object.entries(pokemon.evs)
      .filter(([_, value]) => value != undefined)
      .map(([stat, value]) => `${value} ${stat}`)
      .join(` / `)}
    ${pokemon.nature} Nature
    Moves:
    ${pokemon.moves.map((move) => `- ${move}`).join(`\n`)}
  `);
}
