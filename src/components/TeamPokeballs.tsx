"use client";

import { useGlobalStore } from "@/stores/global-store-provider";
import { Pokeball } from "./Pokeball";

interface Props {
  teamId: string;
}

export function TeamPokeballs({ teamId }: Props) {
  const team = useGlobalStore((state) => state.teams.find((team) => team.uuid === teamId));
  const discordUserMapping = useGlobalStore((state) => state.discordUserMapping);

  return (
    <div className="flex w-full flex-col gap-10">
      <h2 className="text-center text-3xl text-white">{`${discordUserMapping[team?.owner ?? ""]}'s Team`}</h2>
      <div className="flex w-full items-center justify-around">
        {team?.pokemon.map((pokemon) => <Pokeball key={pokemon.uuid} pokemonUuid={pokemon.uuid} />)}
      </div>
    </div>
  );
}
