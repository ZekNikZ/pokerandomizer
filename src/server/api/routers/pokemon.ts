import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { uuidv4 } from "@/utils/uuids";
import _ from "lodash";
import { getPokemonSetData } from "@/client/google-sheets-client";
import discordClient from "@/client/discord-bot-client";

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

      // TODO: EVAN: Post team to Discord
      const { teams } = input;
      await Promise.allSettled(
        teams.map(async (team) => {
          // TODO: Construct team string in standard format for Showdown
          const teamString = `TEST STRING ${team.owner}: ${team.pokemon.join(", ")}`;

          // TODO: Post to Discord
          // Look up Discord Webhooks for this. Use the process.env.DISCORD_WEBHOOK_URL environment variable and format it as you feel
          // If you want to get really fancy, you can call getPokemonData() here as well to grab the sprites and stuff too
          try {
            await (await discordClient.users.fetch(team.owner)).send({ content: teamString });
          } catch (error) {
            console.error("Error posting team to Discord:", error);
          }

          const payload = {
            content: "Testing Posting to Discord",
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
