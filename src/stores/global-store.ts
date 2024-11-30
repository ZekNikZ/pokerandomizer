import { type PokemonSet, type Pokemon } from "@/types/pokemon-types";
import { uuidv4 } from "@/utils/uuids";
import { produce } from "immer";
import { createStore } from "zustand/vanilla";
import { devtools, persist } from "zustand/middleware";
import { api } from "@/trpc/zustand";

export type GlobalState = {
  teams: {
    uuid: string;
    owner: string;
    pokemon: {
      uuid: string;
      pokemonId: string;
      animatingIn: boolean;
      pokeballOpen: boolean;
    }[];
    previousPicks: string[];
  }[];
  nextTeamNames: string[];
  pokemon: Record<string, Pokemon>;
  pokemonSets: Record<string, PokemonSet>;
  settings: {
    "Prevent Same Team Duplicates": boolean;
    "Prevent Same Round Duplicates": boolean;
    "Prevent Cross Team Duplicates": boolean;
    "Modern Type Icons": boolean;
    "Play Pokemon Sound When Opening Pokeball": boolean;
    "Pokemon Tier Hints": boolean;
    "Auto Post Teams to Discord": boolean;
  };
};

export type GlobalActions = {
  createTeams: () => Promise<void>;
  clearTeams: () => void;
  rerollTeams: () => Promise<void>;
  openPokeball: (uuid: string) => void;
  openAllPokeballs: () => void;
  changeSetting: <K extends keyof GlobalState["settings"]>(
    key: K,
    value: GlobalState["settings"][K]
  ) => void;
  changeNextTeamName: (index: number, name: string) => void;
  postTeamsToDiscord: () => Promise<void>;
};

export type GlobalStore = GlobalState & GlobalActions;

export const defaultInitState: GlobalState = {
  teams: [],
  nextTeamNames: ["Team 1", "Team 2", ""],
  pokemon: {},
  pokemonSets: {},
  settings: {
    "Prevent Same Team Duplicates": true,
    "Prevent Same Round Duplicates": true,
    "Prevent Cross Team Duplicates": true,
    "Modern Type Icons": true,
    "Play Pokemon Sound When Opening Pokeball": true,
    "Pokemon Tier Hints": true,
    "Auto Post Teams to Discord": true,
  },
};

export const createGlobalStore = (initState?: Partial<GlobalState>) => {
  return createStore<GlobalStore>()(
    devtools(
      persist(
        (set, get) => ({
          ...defaultInitState,
          ...initState,
          createTeams: async () => {
            set((state) => ({
              teams: state.nextTeamNames
                .filter((name) => name)
                .map((owner) => ({
                  uuid: uuidv4(),
                  owner,
                  pokemon: [],
                  previousPicks: [],
                })),
            }));
            const { teams, settings } = get();
            const picks = await api.pokemon.generateTeams.mutate({
              teamUuids: teams.map((team) => team.uuid),
              preventSameTeamDuplicates: settings["Prevent Same Team Duplicates"],
              preventCrossTeamDuplicates: settings["Prevent Cross Team Duplicates"],
              preventSameRoundDuplicates: settings["Prevent Same Round Duplicates"],
              previousPicks: [],
            });
            set((state) => ({
              teams: state.teams.map((team) => ({
                ...team,
                pokemon:
                  picks.teams[team.uuid]?.map((pokemon) => ({
                    ...pokemon,
                    animatingIn: true,
                    pokeballOpen: false,
                  })) ?? team.pokemon,
              })),
            }));
            const uuids = Object.values(picks.teams).flatMap((team) =>
              team.map((pokemon) => pokemon.uuid)
            );
            setTimeout(() => {
              set(
                produce((state: GlobalState) => {
                  state.teams.forEach((team) => {
                    team.pokemon.forEach((pokemon) => {
                      if (uuids.includes(pokemon.uuid)) {
                        pokemon.animatingIn = false;
                      }
                    });
                  });
                })
              );
            }, 3250);
          },
          clearTeams: () => {
            set(() => ({ teams: [] }));
          },
          rerollTeams: async () => {
            const { teams, settings } = get();
            const picks = await api.pokemon.generateTeams.mutate({
              teamUuids: teams.map((team) => team.uuid),
              preventSameTeamDuplicates: settings["Prevent Same Team Duplicates"],
              preventCrossTeamDuplicates: settings["Prevent Cross Team Duplicates"],
              preventSameRoundDuplicates: settings["Prevent Same Round Duplicates"],
              previousPicks: teams.flatMap((team) => team.previousPicks),
            });
            set((state) => ({
              teams: state.teams.map((team) => ({
                ...team,
                pokemon:
                  picks.teams[team.uuid]?.map((pokemon) => ({
                    ...pokemon,
                    animatingIn: true,
                    pokeballOpen: false,
                  })) ?? team.pokemon,
              })),
            }));
            const uuids = Object.values(picks.teams).flatMap((team) =>
              team.map((pokemon) => pokemon.uuid)
            );
            setTimeout(() => {
              set(
                produce((state: GlobalState) => {
                  state.teams.forEach((team) => {
                    team.pokemon.forEach((pokemon) => {
                      if (uuids.includes(pokemon.uuid)) {
                        pokemon.animatingIn = false;
                      }
                    });
                  });
                })
              );
            }, 3250);
          },
          openPokeball: (uuid: string) =>
            set(
              produce((state: GlobalState) => {
                state.teams.forEach((team) => {
                  team.pokemon.forEach((pokemon) => {
                    if (pokemon.uuid === uuid) {
                      pokemon.pokeballOpen = true;
                    }
                  });
                });

                if (
                  state.teams.every((team) => team.pokemon.every((pokemon) => pokemon.pokeballOpen))
                ) {
                  void get().postTeamsToDiscord();
                }
              })
            ),
          openAllPokeballs: () => {
            get()
              .teams.flatMap((team) =>
                team.pokemon
                  .filter((pokemon) => !pokemon.pokeballOpen)
                  .map((pokemon) => pokemon.uuid)
              )
              .forEach((uuid, i) => setTimeout(() => void get().openPokeball(uuid), i * 1000));
          },
          changeSetting: <K extends keyof GlobalState["settings"]>(
            key: K,
            value: GlobalState["settings"][K]
          ) =>
            set((state) => ({
              settings: {
                ...state.settings,
                [key]: value,
              },
            })),
          changeNextTeamName: (index: number, name: string) =>
            set(
              produce((state: GlobalState) => {
                state.nextTeamNames[index] = name;
              })
            ),
          postTeamsToDiscord: async () => {
            await api.pokemon.postTeamsToDiscord.mutate({
              teams: get().teams.map((team) => ({
                uuid: team.uuid,
                owner: team.owner,
                pokemon: team.pokemon.map((pokemon) => pokemon.pokemonId),
              })),
            });
          },
        }),
        {
          name: "global-store",
          partialize: (state) => ({
            nextTeamNames: state.nextTeamNames,
            settings: state.settings,
          }),
        }
      )
    )
  );
};
