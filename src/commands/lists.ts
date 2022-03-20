import { Message } from "discord.js";
import { DataSource } from "typeorm";
import { messageWithUserMention } from "../utils/discord/channel.messages";
import { List } from "../database/entities/list";
import { User } from "../database/entities/user";
import { normalize } from "../utils/normalize";

export let lists = {};
const actions = {
    display: displayList,
    create: createList,
    deleteitems: deleteListItems,
    additems: addListItems,
    setitems: setListItems,
    rename: renameList,
    delete: deleteList,
};
const actionKeys = Object.keys(actions);

export function run(message: Message, db: DataSource) {
    const actionName = message.content.match(
        new RegExp(`/\?lists (${actionKeys.join("|")})`)
    )?.[1];

    if (actionName) {
        return actions[actionName](message, db);
    }
    actions.display(message, db);
}

function displayList(message: Message, db: DataSource) {
    const listNames = Object.keys(lists[message.author.id] || {});

    if (!(message.author.id in lists) || listNames.length == 0) {
        return messageWithUserMention(message, "You don't have a list.");
    }
    message.channel.send(
        listNames
            .map(
                n =>
                    `\` ${n} \`\n${
                        lists[message.author.id][n]?.join(",") || "Empty."
                    }`
            )
            .join("\n\n")
    );
}

async function createList(message: Message, db: DataSource) {
    const m = message.content.match(/\?lists create ((.*) \[(.*)\]|(.*))/);

    if (!m || !(m[2] || m[1])) {
        return messageWithUserMention(message, "Unable to create a list.");
    }
    const listName = m[2] || m[1];
    const listItemsString = m[3] || "";
    const listsRepository = db.getRepository(List);
    const listExist = await listsRepository.findOne({
        where: { name: listName },
    });

    if (listExist) {
        return messageWithUserMention(
            message,
            "A list with this name already exist."
        );
    }
    const usersRepository = db.getRepository(User);

    if (!(message.author.id in lists)) {
        const user = new User();
        user.userId = message.author.id;
        await usersRepository.save(user);
        lists[message.author.id] = {};
    }
    const list = new List();
    list.user = await usersRepository.findOne({
        where: { userId: message.author.id },
    });
    list.items = listItemsString;
    list.name = listName;
    listsRepository.save(list);
    lists[message.author.id][listName] = listItemsString
        .split(",")
        .filter(d => d.length);
}

async function addListItems(message: Message, db: DataSource) {
    const m = message.content.match(/\?lists additems (.*) \[(.*)\]/);

    if (!m || !m[2] || m[2].length == 0) {
        return messageWithUserMention(
            message,
            "Cannot add items in your list."
        );
    }
    const listName = m[1];
    const items = m[2];

    if (
        !listName ||
        !(message.author.id in lists) ||
        !(listName in lists[message.author.id])
    ) {
        return messageWithUserMention(
            message,
            "The list you wanted to update doesn't exist."
        );
    }
    const listsRepository = db.getRepository(List);
    const list = await listsRepository.findOne({ where: { name: listName } });
    lists[message.author.id][listName] = [
        ...lists[message.author.id][listName],
        ...items.split(",").filter(d => d.length),
    ];
    list.items = lists[message.author.id][listName].join(",");
    listsRepository.save(list);
}

async function setListItems(message: Message, db: DataSource) {
    const m = message.content.match(/\?lists setitems (.*) \[(.*)\]/);

    if (!m || !m[2] || m[2].length == 0) {
        return messageWithUserMention(message, "Cannot set items in the list.");
    }
    const listName = m[1];
    const items = m[2];

    if (
        !listName ||
        !(message.author.id in lists) ||
        !(listName in lists[message.author.id])
    ) {
        return messageWithUserMention(
            message,
            "The list you wanted to update doesn't exist."
        );
    }
    const listsRepository = db.getRepository(List);
    const list = await listsRepository.findOne({ where: { name: listName } });
    list.items = items;
    listsRepository.save(list);
    lists[message.author.id][listName] = items.split(",").filter(d => d.length);
}

async function deleteListItems(message: Message, db: DataSource) {
    const m = message.content.match(/\?lists deleteitems (.*) \[(.*)\]/);

    if (!m || !m[2] || m[2].length == 0) {
        return messageWithUserMention(
            message,
            "Cannot delete items in the list."
        );
    }
    const listName = m[1];
    const items = m[2];

    if (
        !listName ||
        !(message.author.id in lists) ||
        !(listName in lists[message.author.id])
    ) {
        return messageWithUserMention(
            message,
            "The list you wanted to update doesn't exist."
        );
    }
    const itemsArray = normalize(items)
        .toLowerCase()
        .replace(/\s/g, "")
        .split(",")
        .filter(d => d.length);
    const listsRepository = db.getRepository(List);
    const list = await listsRepository.findOne({ where: { name: listName } });
    lists[message.author.id][listName] = lists[message.author.id][
        listName
    ].filter(
        el =>
            !itemsArray.includes(normalize(el).toLowerCase().replace(/\s/g, ""))
    );
    list.items = lists[message.author.id][listName].join(",");
    listsRepository.save(list);
}

async function renameList(message: Message, db: DataSource) {
    const m = message.content.match(/\?lists rename (.*) to "(.*)"/);

    if (!m || !m[2] || m[2].length == 0) {
        return messageWithUserMention(message, "Cannot rename your list.");
    }
    const listName = m[1];
    const newListName = m[2];

    if (
        !listName ||
        !(message.author.id in lists) ||
        !(listName in lists[message.author.id])
    ) {
        return messageWithUserMention(
            message,
            "The list you wanted to rename doesn't exist."
        );
    }
    const listsRepository = db.getRepository(List);
    const list = await listsRepository.findOne({ where: { name: listName } });
    list.name = newListName;
    listsRepository.save(list);
    lists[message.author.id][newListName] = lists[message.author.id][listName];
    delete lists[message.author.id][listName];
}

async function deleteList(message: Message, db: DataSource) {
    const listName = message.content.match(/\?lists delete (.*)/)?.[1];

    if (
        !listName ||
        !(message.author.id in lists) ||
        !(listName in lists[message.author.id])
    ) {
        return messageWithUserMention(
            message,
            "The list you wanted to delete doesn't exist."
        );
    }
    const listsRepository = db.getRepository(List);
    const list = await listsRepository.findOne({ where: { name: listName } });
    listsRepository.remove(list);
    delete lists[message.author.id][listName];
}

export async function initLists(db: DataSource) {
    const usersRepository = db.getRepository(User);
    const users = await usersRepository.find({ relations: { lists: true } });

    for (const user of users) {
        lists[user.userId] = {};

        for (const list of user.lists) {
            lists[user.userId][list.name] = list.items
                .split(",")
                .filter(d => d.length);
        }
    }
}

export const config = {
    commandInfo:
        '` ?lists `\n_Displays every list you have_\n` ?lists delete <list name> `\n_Deletes a list_\n` ?lists additems <items> `\n_Add items to your list_\n` ?lists setitems <list name> <items> `\n_Set items in your list_\n`?lists deleteitems <list name> <items> `\n_Delete items in your list_\n` ?lists create <list name> <items> `\n_Creates a new list._\n` ?lists rename <list name> to "<new list name>" `\n_Renames a list._',
    commandDetailedInfo:
        "**<list name>**: Name of the list\n**<items>**: List of items surrounded by brackets and separated by a comma. Example: [Apple,Peach,Ice Cream,Banana]",
};
