import { Message } from "discord.js";
import commands from "./commands/index";

export function isCommand(message: Message) {
    return message.content.startsWith("?");
}

export function getCommandName(content: string) {
    return content.match(/\?([^\s]+)/)?.[1];
}

export async function runCommand(message: Message) {
    commands[getCommandName(message.content)]?.run(message);
}
