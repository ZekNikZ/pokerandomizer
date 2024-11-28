import { HydrateClient } from "@/trpc/server";
import HomePage from "./page.client";

export default function Home() {
  return (
    <HydrateClient>
      <HomePage />
    </HydrateClient>
  );
}
