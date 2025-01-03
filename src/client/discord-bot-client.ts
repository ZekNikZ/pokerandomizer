import { Client } from "discord.js";

// TODO: this should really be a separate process single Next.js is creating this each request
// TODO: good enough for now, bad for production

const discordClient = new Client({
  intents: ["Guilds", "GuildMessages", "GuildMembers", "DirectMessages"],
});

let readyClient: Client | undefined = undefined;
export default async function getDiscordClient(): Promise<Client> {
  if (readyClient) {
    return readyClient;
  }

  return await new Promise((resolve, reject) => {
    function err(err: Error) {
      console.error("Error connecting to Discord:", err);
      reject(err);
    }
    discordClient.once("error", err);
    discordClient.once("ready", () => {
      discordClient.removeListener("error", err);
      console.log("Discord bot is ready!");
      readyClient = discordClient;
      resolve(readyClient);
    });

    void discordClient.login(process.env.DISCORD_BOT_TOKEN);
  });
}
