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
