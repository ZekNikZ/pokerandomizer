import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { uuidv4 } from "@/utils/uuids";
import _ from "lodash";
import { getPokemonSetData } from "@/client/google-sheets-client";
import discordClient from "@/client/discord-bot-client";
import dedent from "dedent";
import { stat } from "fs";
import { getDiscordUserMapping } from "@/utils/discord";

export const pokemonRouter = createTRPCRouter({
  generateTeams: publicProcedure
    .input(
      z.object({
        teamUuids: z.array(z.string()),
        preventSameTeamDuplicates: z.boolean(),
        preventCrossTeamDuplicates: z.boolean(),
        preventSameRoundDuplicates: z.boolean(),
        previousPicks: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      // Fetch data from Google Sheets
      const pokemonSets = await getPokemonSetData();
      return {
        teams: Object.fromEntries(
          input.teamUuids.map((teamUuid) => {
            // TODO: EVAN: Randomize the team
            // TODO:
            //   1-2 Tier 1
            //   0-3 Tier 2
            //   0-3 Tier 3
            //   1 Tier 4
            // GUARANTEED TIER 1 & 4, rest random
            const pokemon: { uuid: string; pokemonId: string }[] = _.shuffle(
              Object.keys(pokemonSets)
            )
              .slice(0, 6)
              .map((pokemonId) => ({
                uuid: uuidv4(),
                pokemonId,
              }));

            return [teamUuid, pokemon];
          })
        ),
      };
    }),
  postTeamsToDiscord: publicProcedure
    .input(
      z.object({
        teams: z.array(
          z.object({
            uuid: z.string(),
            owner: z.string(),
            pokemon: z.array(z.string()),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      // Fetch data from Google Sheets
      const pokemonSets = await getPokemonSetData();

      const discordUserMapping = await getDiscordUserMapping(process.env.DISCORD_GUILD_ID!);

      // TODO: EVAN: Post team to Discord
      const { teams } = input;
      await Promise.allSettled(
        teams.map(async (team) => {
          // TODO: Construct team string in standard format for Showdown 
          /*
          - Pokémon Name @ Item
            Ability: Ability Name
            Level: 100
            EVs: X HP / Y Atk / Z Def / W SpA / V SpD / U Spe
            Nature: Nature Name
            Moves:
            - Move 1
            - Move 2
            - Move 3
            - Move 4
          */


          //Construct in standard format for Showdown
          const teamString = team.pokemon.map((pokemonId) => {
            const pokemon = pokemonSets[pokemonId]!;
            return dedent`${pokemon.nickname&& pokemon.nickname.length > 0 ? pokemon.nickname: pokemon.showdownName} (${pokemon.showdownName}) @ ${pokemon.item}
            Ability: ${pokemon.ability}
            Tera Type: ${pokemon.teraType}
            Level: 100
            EVs: ${Object.entries(pokemon.evs).filter(([_, value]) => value != undefined).map(([stat, value]) => `${value} ${stat}`).join(` / `)}
            ${pokemon.nature} Nature
            Moves: \n ${pokemon.moves.map((move) => `- ${move}`).join(`\n`)}
          `;
        
          }).join("\n\n");
          // TODO: Post to Discord
          // Look up Discord Webhooks for this. Use the process.env.DISCORD_WEBHOOK_URL environment variable and format it as you feel
          // If you want to get really fancy, you can call getPokemonData() here as well to grab the sprites and stuff too
          try {
            await (await discordClient.users.fetch(team.owner)).send({ content:"``` " + teamString + "```" });
          } catch (error) {
            console.error("Error posting team to Discord:", error);
          }

          const payload = {
            content: `Matchup: ${teams.map(team => discordUserMapping[team.owner]).join(' vs ')} \n Team: ${discordUserMapping[team.owner]} \n ${"```"}${teamString}${"```"}`,
          };
          try {
            const webhook = process.env.DISCORD_WEBHOOK_URL!;
            const response = await fetch(webhook, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(
                //teamString,
                payload
              ),
            });

            if (!response.ok) {
              throw new Error("Failed to post to Discord");
            }
          } catch (error) {
            console.error(error);
          }
        })
      );
    }),
});
