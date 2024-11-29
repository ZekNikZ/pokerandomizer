import { type PokemonSet, type Pokemon } from "@/types/pokemon-types";
import { uuidv4 } from "@/utils/uuids";
import { produce } from "immer";
import { createStore } from "zustand/vanilla";
import { devtools } from "zustand/middleware";
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
  pokemon: Record<string, Pokemon>;
  pokemonSets: Record<string, PokemonSet>;
  settings: {
    "Prevent Same Team Duplicates": boolean;
    "Prevent Same Round Duplicates": boolean;
    "Prevent Cross Team Duplicates": boolean;
    "Modern Type Icons": boolean;
    "Play Pokemon Sound When Opening Pokeball": boolean;
    "Pokemon Tier Hints": boolean;
  };
};

export type GlobalActions = {
  createTeams: (owners: string[]) => Promise<void>;
  clearTeams: () => void;
  rerollTeams: () => Promise<void>;
  openPokeball: (uuid: string) => void;
  openAllPokeballs: () => void;
  changeSetting: <K extends keyof GlobalState["settings"]>(
    key: K,
    value: GlobalState["settings"][K]
  ) => void;
};

export type GlobalStore = GlobalState & GlobalActions;

export const defaultInitState: GlobalState = {
  teams: [],
  pokemon: {},
  pokemonSets: {
    "zygarde-10-power-construct": {
      id: "zygarde-10-power-construct",
      tier: 1,
    },
    pikachu: {
      id: "pikachu",
      tier: 2,
    },
    snorlax: {
      id: "snorlax",
      tier: 3,
    },
    charizard: {
      id: "charizard",
      tier: 4,
    },
  },
  settings: {
    "Prevent Same Team Duplicates": true,
    "Prevent Same Round Duplicates": true,
    "Prevent Cross Team Duplicates": true,
    "Modern Type Icons": true,
    "Play Pokemon Sound When Opening Pokeball": true,
    "Pokemon Tier Hints": true,
  },
};

export const createGlobalStore = (initState?: Partial<GlobalState>) => {
  return createStore<GlobalStore>()(
    devtools((set, get) => ({
      ...defaultInitState,
      ...initState,
      createTeams: async (owners: string[]) => {
        set(() => ({
          teams: owners.map((owner) => ({
            uuid: uuidv4(),
            owner,
            pokemon: [],
            previousPicks: [],
          })),
        }));
        const { teams, settings } = get();
        const picks = await api.pokemon.generateTeams.query({
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
        const picks = await api.pokemon.generateTeams.query({
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
          })
        ),
      openAllPokeballs: () => {
        get()
          .teams.flatMap((team) =>
            team.pokemon.filter((pokemon) => !pokemon.pokeballOpen).map((pokemon) => pokemon.uuid)
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
    }))
  );
};
