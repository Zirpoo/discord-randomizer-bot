import env from "dotenv";
env.config();

import { Client, Intents } from "discord.js";
import chalk from "chalk";
import { runCommand } from "./commands/index";
import { createDatabase } from "./database/index";

(async () => {
    const db = await createDatabase();

    if (!db) {
        return;
    }
    const client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    });
    client.on("ready", () =>
        console.log(
            `${chalk.bgBlue(" Discord ")} Logged in as ${chalk.bold(
                client.user.tag
            )}`
        )
    );
    client.on("messageCreate", m => runCommand(m, db));
    client.login(process.env.TOKEN);
})();
