import { type Pokemon } from "@/types/pokemon-types";
import { uuidv4 } from "@/utils/uuids";
import { produce } from "immer";
import { createStore } from "zustand/vanilla";

export type GlobalState = {
  teams: {
    uuid: string;
    pokemon: {
      uuid: string;
      pokemonId: string;
      animatingIn: boolean;
      pokeballOpen: boolean;
    }[];
  }[];
  pokemon: Record<string, Pokemon>;
};

export type GlobalActions = {
  createTeam: () => void;
  removeTeam: (uuid: string) => void;
  openPokeball: (uuid: string) => void;
};

export type GlobalStore = GlobalState & GlobalActions;

export const defaultInitState: GlobalState = {
  teams: [],
  pokemon: {},
};

export const createGlobalStore = (initState?: Partial<GlobalState>) => {
  return createStore<GlobalStore>()((set) => ({
    ...defaultInitState,
    ...initState,
    createTeam: () => {
      const uuid = uuidv4();

      set((state) => ({
        teams: [
          ...state.teams,
          {
            uuid,
            pokemon: [
              { uuid: uuidv4(), pokemonId: "pikachu", animatingIn: true, pokeballOpen: false },
              {
                uuid: uuidv4(),
                pokemonId: "zygarde-10-power-construct",
                animatingIn: true,
                pokeballOpen: false,
              },
              { uuid: uuidv4(), pokemonId: "pikachu", animatingIn: true, pokeballOpen: false },
              {
                uuid: uuidv4(),
                pokemonId: "zygarde-10-power-construct",
                animatingIn: true,
                pokeballOpen: false,
              },
              { uuid: uuidv4(), pokemonId: "pikachu", animatingIn: true, pokeballOpen: false },
              {
                uuid: uuidv4(),
                pokemonId: "zygarde-10-power-construct",
                animatingIn: true,
                pokeballOpen: false,
              },
            ],
          },
        ],
      }));
      setTimeout(() => {
        set(
          produce((state: GlobalState) => {
            state.teams.forEach((team) => {
              if (team.uuid === uuid) {
                team.pokemon.forEach((pokemon) => {
                  pokemon.animatingIn = false;
                });
              }
            });
          })
        );
      }, 3250);
    },
    removeTeam: (uuid: string) =>
      set((state) => ({ teams: state.teams.filter((team) => team.uuid !== uuid) })),
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
  }));
};
