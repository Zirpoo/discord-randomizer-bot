import { Message } from "discord.js";
import { DataSource } from "typeorm";
import { commands } from "./index";

export function run(message: Message, db: DataSource) {
    const commandInfos = [];

    for (const key in commands) {
        if (key != "help") {
            commandInfos.push(
                `${commands[key].config.commandInfo}\n\n${commands[key].config.commandDetailedInfo}`
            );
        }
    }
    if (commandInfos.length) {
        message.channel.send(commandInfos.join("\n\n"));
    }
}
