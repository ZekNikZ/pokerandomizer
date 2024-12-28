import "@/styles/globals.css";

import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { GlobalStoreProvider } from "@/stores/global-store-provider";
import { getPokemonData } from "@/client/pokeapi-client";
import { Aldrich } from "next/font/google";
import { getPokemonSetData } from "@/client/google-sheets-client";
import { getDiscordUserMapping } from "@/utils/discord";

const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "PokeRandomizer",
  description: "Pokemon team randomizer",
  icons: [{ rel: "icon", url: "/images/pokeball.png" }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pokemonSets = await getPokemonSetData();
  const discordUserMapping = await getDiscordUserMapping(process.env.DISCORD_GUILD_ID!);

  // Get pokemon API data for each of the pokemon sets
  const pokemon = await getPokemonData(Object.values(pokemonSets).map((set) => set.id));

  return (
    <html lang="en">
      <body className={aldrich.className}>
        <TRPCReactProvider>
          <GlobalStoreProvider serverData={{ pokemon, pokemonSets, discordUserMapping }}>
            {children}
          </GlobalStoreProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
