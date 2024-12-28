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
        randomizationSettings: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Fetch data from Google Sheets
      const pokemonSets = await getPokemonSetData();
      const pokemon = Object.values(pokemonSets).map((set) => ({
        id: set.id,
        tier: set.tier,
      }));

      // Parse randomization settings
      const randomizationSettings = input.randomizationSettings.split(",");
      const tiers = randomizationSettings.map((tier) => {
        if (tier.includes("-")) {
          const [min, max] = tier.split("-").map((tier) => Number(tier)) as [number, number];
          return Math.floor(Math.random() * (max - min + 1)) + min;
        } else {
          return Number(tier);
        }
      });

      // Setup previous picks
      const previousPicks = new Set<string>();
      if (input.preventSameRoundDuplicates) {
        input.previousPicks.forEach((pick) => previousPicks.add(pick));
      }

      // Randomize teams
      const teams: Record<string, { uuid: string; pokemonId: string }[]> = {};
      for (const teamId of input.teamUuids) {
        // Initialize array for team
        const picks: { uuid: string; pokemonId: string }[] = [];

        // Randomize team
        for (const tier of tiers) {
          const shuffledPokemon = _.shuffle(pokemon);
          // Randomize pokemon
          let pokemonId = shuffledPokemon.find(
            (pokemon) => pokemon.tier === tier && !previousPicks.has(pokemon.id)
          )?.id;
          if (!pokemonId) {
            pokemonId = shuffledPokemon.find((pokemon) => pokemon.tier === tier)?.id;
          }
          if (!pokemonId) {
            throw new Error(`No pokemon found for tier ${tier}`);
          }

          picks.push({ uuid: uuidv4(), pokemonId });

          if (input.preventSameTeamDuplicates) {
            previousPicks.add(pokemonId);
          }
        }

        if (input.preventCrossTeamDuplicates) {
          picks.forEach((pick) => previousPicks.add(pick.pokemonId));
        }

        teams[teamId] = _.shuffle(picks);
      }

      return {
        teams,
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
