import { getPokemonSetData } from "@/client/google-sheets-client";
import { getPokemonData } from "@/client/pokeapi-client";
import { getDiscordUserMapping } from "@/utils/discord";
import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("pokemon-sets");
  revalidateTag("pokemon-data");
  revalidateTag("discord-user-mapping");

  const [sets, discordUserMapping] = await Promise.all([
    getPokemonSetData(),
    getDiscordUserMapping(process.env.DISCORD_GUILD_ID!),
  ]);

  const data = await getPokemonData(Object.values(sets).map((set) => set.id));

  return Response.json({
    discordUserCount: Object.keys(discordUserMapping).length,
    setCount: Object.keys(sets).length,
    dataCount: Object.keys(data).length,
    missingPokemon: Object.keys(sets).filter((id) => !data[id]),
  });
}
