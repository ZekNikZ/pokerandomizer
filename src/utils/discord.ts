import getDiscordClient from "@/client/discord-bot-client";
import { unstable_cache } from "next/cache";

export const getDiscordUserMapping = unstable_cache(
  async function (guildId: string): Promise<Record<string, string>> {
    // Get guild
    console.log("Fetching discord user mapping");
    try {
      const guild = (await getDiscordClient()).guilds.cache.get(guildId);
      if (!guild) {
        throw new Error(`Guild with ID ${guildId} not found`);
      }

      // Get members
      const members = await guild.members.fetch();

      // Create mappings
      const mappings: Record<string, string> = {};
      members.forEach((member) => {
        mappings[member.user.id] = member.nickname ?? member.user.displayName;
      });

      return mappings;
    } catch (error) {
      console.error("Error fetching Discord guild members:", error);
      return {};
    }
  },
  ["discord-user-mapping"],
  {
    revalidate: 3600,
    tags: ["discord-user-mapping"],
  }
);
