import getDiscordClient from "@/client/discord-bot-client";

export async function getDiscordUserMapping(guildId: string): Promise<Record<string, string>> {
  // Get guild
  try {
    const guild = await (await getDiscordClient()).guilds.fetch(guildId);
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
}
