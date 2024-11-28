/* eslint-disable @next/next/no-img-element */
"use client";

import clsx from "clsx";
import styles from "./pokeballs.module.scss";
import { useGlobalStore } from "@/stores/global-store-provider";
import { Aldrich } from "next/font/google";
import useSound from "use-sound";

const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });

interface Props {
  pokemonUuid: string;
}

export function Pokeball({ pokemonUuid }: Props) {
  const pokemon = useGlobalStore((state) =>
    state.teams.flatMap((team) => team.pokemon).find((pokemon) => pokemon.uuid === pokemonUuid)
  );
  const openPokeball = useGlobalStore((state) => state.openPokeball);
  const pokemonData = useGlobalStore((state) =>
    pokemon ? state.pokemon[pokemon?.pokemonId] : undefined
  );
  const [playSound] = useSound(pokemonData!.cry);

  const onClick = () => {
    openPokeball(pokemonUuid);
    playSound();
  };

  return (
    <div
      className={clsx(styles.pokeballContainer, {
        [styles.rollIn!]: pokemon?.animatingIn,
        [styles.open!]: pokemon?.pokeballOpen,
      })}
      onClick={() => void onClick()}
    >
      <img src="/images/pokeball.png" className={styles.pokeball} alt="pokeball" />
      <img src={pokemonData?.sprite} className={styles.pokemon} alt="" />
      <div className={`${aldrich.className} ${styles.text}`}>{pokemonData?.name}</div>
    </div>
  );
}
