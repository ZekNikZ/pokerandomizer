import "@/styles/globals.css";

import { type Metadata } from "next";
import { TRPCReactProvider } from "@/trpc/react";
import { GlobalStoreProvider } from "@/stores/global-store-provider";
import { getPokemonData } from "@/client/pokeapi-client";

export const metadata: Metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pokemon = await getPokemonData(["zygarde-10-power-construct", "pikachu", "snorlax"]);

  return (
    <html lang="en">
      <body>
        <TRPCReactProvider>
          <GlobalStoreProvider serverData={{ pokemon }}>{children}</GlobalStoreProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
