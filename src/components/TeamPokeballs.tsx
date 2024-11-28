"use client";

import { useGlobalStore } from "@/stores/global-store-provider";
import { Pokeball } from "./Pokeball";

interface Props {
  teamId: string;
}

export function TeamPokeballs({ teamId }: Props) {
  const team = useGlobalStore((state) => state.teams.find((team) => team.uuid === teamId));

  return (
    <div className="flex flex-col gap-10 w-full">
      <h2 className="text-white text-center text-3xl">{`${team?.owner}'s Team`}</h2>
      <div className="flex items-center justify-around w-full">
        {team?.pokemon.map((pokemon) => <Pokeball key={pokemon.uuid} pokemonUuid={pokemon.uuid} />)}
      </div>
    </div>
  );
}
