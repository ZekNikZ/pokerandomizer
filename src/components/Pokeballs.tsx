"use client";

import styles from "./pokeballs.module.scss";
import { useGlobalStore } from "@/stores/global-store-provider";
import { Pokeball } from "./Pokeball";

interface Props {
  teamId: string;
}

export function Pokeballs({ teamId }: Props) {
  const team = useGlobalStore((state) => state.teams.find((team) => team.uuid === teamId));

  return (
    <div className={styles.pokeballs}>
      {team?.pokemon.map((pokemon) => <Pokeball key={pokemon.uuid} pokemonUuid={pokemon.uuid} />)}
    </div>
  );
}
