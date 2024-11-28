/* eslint-disable @next/next/no-img-element */
"use client";

import clsx from "clsx";
import styles from "./pokeballs.module.scss";
import { useGlobalStore } from "@/stores/global-store-provider";
import { Aldrich } from "next/font/google";
import useSound from "use-sound";
import { useEffect, useState } from "react";

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
  const modernTypeIcons = useGlobalStore((state) => state.settings["Modern Type Icons"]);
  const playSoundWhenOpeningPokeball = useGlobalStore(
    (state) => state.settings["Play Pokemon Sound When Opening Pokeball"]
  );

  const [playSound] = useSound(pokemonData!.cry);
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    if (pokemon?.pokeballOpen && !soundPlayed) {
      setSoundPlayed(true);
      if (playSoundWhenOpeningPokeball) {
        playSound();
      }
    }
  }, [playSound, playSoundWhenOpeningPokeball, pokemon?.pokeballOpen, soundPlayed]);

  const onClick = () => {
    if (!pokemon?.pokeballOpen) {
      openPokeball(pokemonUuid);
    }
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
      <div className={styles.types}>
        {pokemonData?.types.map((type) => (
          <img
            key={type.id}
            className={styles.typeImage}
            src={
              modernTypeIcons
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/brilliant-diamond-and-shining-pearl/${type.id}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vii/ultra-sun-ultra-moon/${type.id}.png`
            }
            alt={type.name}
          />
        ))}
      </div>
    </div>
  );
}
