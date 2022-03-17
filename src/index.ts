import env from "dotenv";
import { Client, Intents } from "discord.js";
import { isCommand, runCommand } from "./commands.manager";

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
env.config();

client.on("ready", () => console.log(`Logged in as ${client.user.tag}!`));
client.on("messageCreate", m => isCommand(m) && runCommand(m));
client.login(process.env.TOKEN);
