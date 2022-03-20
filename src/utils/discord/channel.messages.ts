import { Message, Formatters } from "discord.js";

export function messageWithUserMention(message: Message, text: string) {
    message.channel.send(
        `${Formatters.userMention(message.author.id)}\n${text}`
    );
}
