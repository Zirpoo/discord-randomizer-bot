import { Message } from "discord.js";
import { messageWithUserMention } from "../channel.sendMessage";

export let lists = {};
const actions = {
    create: createList,
    setdata: setListData,
    delete: deleteList,
};
const actionKeys = Object.keys(actions);

export function run(message: Message) {
    const actionName = message.content.match(
        new RegExp(`/\?lists (${actionKeys.join("|")})`)
    )?.[1];

    if (actionName) {
        actions[actionName](message);
        return;
    }
    const listNames = Object.keys(lists[message.author.id] || {});

    if (!(message.author.id in lists) || listNames.length == 0) {
        messageWithUserMention(message, "You don't have a list.");
        return;
    }
    message.channel.send(
        listNames
            .map(
                n =>
                    `\` ${n} \`\n${
                        lists[message.author.id][n]?.join(", ") || "Empty."
                    }`
            )
            .join("\n\n")
    );
}

function createList(message: Message) {
    const m = message.content.match(/\?lists create ((.*) \[(.*)\]|(.*))/);
    const listName = m[2] || m[1];
    const listData = m[3]?.split(",") || [];

    if (!listName) {
        messageWithUserMention(message, "Unable to create a list.");
    }
    if (!(message.author.id in lists)) {
        lists[message.author.id] = {};
    }
    lists[message.author.id][listName] = listData;
}

function setListData(message: Message) {
    const m = message.content.match(/\?lists setdata (.*) \[(.*)\]/);
    const listName = m[1];
    const data = m[2]?.split(",");

    if (!data) {
        messageWithUserMention(message, "Cannot set your data in the list.");
        return;
    }
    if (
        !listName ||
        !(message.author.id in lists) ||
        !(listName in lists[message.author.id])
    ) {
        messageWithUserMention(
            message,
            "The list you wanted to delete doesn't exist."
        );
        return;
    }
    lists[message.author.id][listName] = data;
}

function deleteList(message: Message) {
    const listName = message.content.match(/\?lists delete (.*)/)?.[1];

    if (
        !listName ||
        !(message.author.id in lists) ||
        !(listName in lists[message.author.id])
    ) {
        messageWithUserMention(
            message,
            "The list you wanted to delete doesn't exist."
        );
        return;
    }
    delete lists[message.author.id][listName];
}

export const config = {
    commandInfo:
        "` ?lists `\n_Displays every list you have_\n` ?lists delete <list name> `\n_Deletes a list._\n` ?lists setdata <list name> <choices> `\n_Changes the list data._\n` ?lists create <list name> <choices> `\n_Creates a new list._",
    commandDetailedInfo:
        "**<list name>**: Name of the list\n**<choices>**: List of choices surrounded by brackets and separated by a comma. Example: [Apple,Peach,Ice Cream,Banana]",
};
