import { Message } from "discord.js";
import { lists } from "./lists";
import { messageWithUserMention } from "../channel.sendMessage";

export function run(message: Message) {
    const authorId = message.author.id;

    if (!(authorId in lists)) {
        messageWithUserMention(message, "You don't have a list.");
        return;
    }
    const m = message.content.match(
        /\?random ((.*) ([0-9]+) (yes|no)|(.*) ([0-9]+)|(.*))/i
    );

    if (!m) {
        messageWithUserMention(message, "Unable to randomize your list.");
        return;
    }
    const listName = m[2] ?? m[5] ?? m[7];
    let count = m[3] ?? m[6] ?? 1;
    const unique = m[4]?.toLowerCase() === "yes" ?? false;

    if (!listName || !(listName in lists[authorId])) {
        messageWithUserMention(
            message,
            "The list you wanted to use doesn't exist."
        );
        return;
    }
    const list = lists[authorId][listName]?.slice(0);
    const results = [];

    if (unique && count > list.length) {
        count = list.length;
    }
    for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * list.length);
        results.push(list[index]);

        if (unique) {
            list.splice(index, 1);
        }
    }
    message.channel.send(`${results.join(", ")}`);
}

export const config = {
    commandInfo:
        "` ?random <list name> <count> <unique>`\n_Displays one or multiple random choices from your list_",
    commandDetailedInfo:
        "**<list name>**: The name you have given to one of your list\n**<count>**: A number of times it should randomise your list. Default: 1\n**<unique>**: Excludes a choice once it has been choosen. If set to Yes, the count cannot exeed the number of choices. Default: No",
};
