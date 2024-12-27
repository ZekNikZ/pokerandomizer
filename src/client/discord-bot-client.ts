import { Client } from "discord.js";

const discordClient = new Client({
  intents: ["Guilds", "GuildMessages", "GuildMembers", "DirectMessages"],
});

discordClient.once("ready", () => {
  console.log("Discord bot is ready!");
});

void discordClient.login(process.env.DISCORD_BOT_TOKEN);

export default discordClient;
