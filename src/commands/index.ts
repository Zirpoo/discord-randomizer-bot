import { Message } from "discord.js";
import { DataSource } from "typeorm";
import * as help from "./help";
import * as lists from "./lists";
import * as random from "./random";

export const commands = { help, lists, random };

export function isCommand(message: Message) {
    return message.content.startsWith("?");
}

export function getCommandName(content: string) {
    return content.match(/\?([^\s]+)/)?.[1];
}

export async function runCommand(message: Message, db: DataSource) {
    if (isCommand(message)) {
        commands[getCommandName(message.content)]?.run(message, db);
    }
}
