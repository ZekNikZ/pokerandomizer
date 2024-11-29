import "@/styles/globals.css";

import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { GlobalStoreProvider } from "@/stores/global-store-provider";
import { getPokemonData } from "@/client/pokeapi-client";
import { Aldrich } from "next/font/google";

const aldrich = Aldrich({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "PokeRandomizer",
  description: "Pokemon team randomizer",
  icons: [{ rel: "icon", url: "/images/pokeball.png" }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pokemon = await getPokemonData([
    "zygarde-10-power-construct",
    "pikachu",
    "snorlax",
    "charizard",
  ]);

  return (
    <html lang="en">
      <body className={aldrich.className}>
        <TRPCReactProvider>
          <GlobalStoreProvider serverData={{ pokemon }}>{children}</GlobalStoreProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
