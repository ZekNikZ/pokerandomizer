import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { uuidv4 } from "@/utils/uuids";

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
    .query(({ input }) => {
      return {
        teams: {
          ...Object.fromEntries(
            input.teamUuids.map((teamUuid) => [
              teamUuid,
              [
                {
                  uuid: uuidv4(),
                  pokemonId: "zygarde-10-power-construct",
                },
                {
                  uuid: uuidv4(),
                  pokemonId: "zygarde-10-power-construct",
                },
                {
                  uuid: uuidv4(),
                  pokemonId: "pikachu",
                },
                {
                  uuid: uuidv4(),
                  pokemonId: "pikachu",
                },
                {
                  uuid: uuidv4(),
                  pokemonId: "snorlax",
                },
                {
                  uuid: uuidv4(),
                  pokemonId: "snorlax",
                },
              ],
            ])
          ),
        },
      };
    }),
});
