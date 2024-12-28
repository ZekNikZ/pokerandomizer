import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { uuidv4 } from "@/utils/uuids";
import _ from "lodash";
import { getPokemonSetData } from "@/client/google-sheets-client";
import dedent from "dedent";
import getDiscordClient from "@/client/discord-bot-client";
import { type GlobalState } from "@/stores/global-store";

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
      const tiers = randomizationSettings
        .map((tier) => {
          if (tier.includes("-")) {
            const [min, max] = tier.split("-").map((tier) => Number(tier)) as [number, number];
            return Math.floor(Math.random() * (max - min + 1)) + min;
          } else {
            return Number(tier);
          }
        })
        .sort((a, b) => a - b);
      const generationSettings: GlobalState["teams"][number]["generationSettings"] = {
        preventCrossTeamDuplicates: input.preventCrossTeamDuplicates,
        preventSameRoundDuplicates: input.preventSameRoundDuplicates,
        preventSameTeamDuplicates: input.preventSameTeamDuplicates,
        tiers,
      };

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
        generationSettings,
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
            generationSettings: z.optional(
              z.object({
                preventSameTeamDuplicates: z.boolean(),
                preventCrossTeamDuplicates: z.boolean(),
                preventSameRoundDuplicates: z.boolean(),
                tiers: z.array(z.number()),
              })
            ),
          })
        ),
        discordUserMapping: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ input }) => {
      // Fetch data from Google Sheets
      const pokemonSets = await getPokemonSetData();

      // Post teams to Discord
      await Promise.allSettled(
        input.teams.map(async (team) => {
          // Construct in standard format for Showdown
          const teamString = team.pokemon
            .map((pokemonId) => {
              const pokemon = pokemonSets[pokemonId]!;

              return dedent`
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
              `;
            })
            .join("\n\n");

          // Post to Discord
          const generationSettings = team.generationSettings;
          const discordUserMapping = input.discordUserMapping;
          const content = dedent`
            **Matchup:** ${input.teams.map((team) => discordUserMapping[team.owner]).join(" vs ")}
            **Team:** ${discordUserMapping[team.owner]}
            **Generation Settings:**
            - Prevent Same Team Duplicates: ${generationSettings?.preventSameTeamDuplicates ?? "N/A"}
            - Prevent Same Round Duplicates: ${generationSettings?.preventSameRoundDuplicates ?? "N/A"}
            - Prevent Cross Team Duplicates: ${generationSettings?.preventCrossTeamDuplicates ?? "N/A"}
            - Tiers: ${generationSettings?.tiers.join(", ") ?? "N/A"}
            \`\`\`
            ${teamString}
            \`\`\`
          `;

          // DM team to owner
          try {
            await (await (await getDiscordClient()).users.fetch(team.owner)).send({ content });
          } catch (error) {
            console.error("Error posting team to Discord:", error);
          }

          // Post to Discord webhook
          const payload = {
            content,
          };
          try {
            const webhook = process.env.DISCORD_WEBHOOK_URL!;
            const response = await fetch(webhook, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
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
