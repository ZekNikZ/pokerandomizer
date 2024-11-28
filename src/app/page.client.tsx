"use client";

import { Pokeballs } from "@/components/Pokeballs";
import { useGlobalStore } from "@/stores/global-store-provider";
import { useEffect } from "react";

export default function HomePage() {
  const { teams, createTeam } = useGlobalStore((state) => state);

  useEffect(() => {
    createTeam();
    createTeam();
  }, [createTeam]);

  return (
    <>
      {teams.map((team) => (
        <Pokeballs key={team.uuid} teamId={team.uuid} />
      ))}
    </>
  );
}
