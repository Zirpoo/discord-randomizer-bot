import { Message } from "discord.js";
import commands from "./index";

export function run(message: Message) {
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
