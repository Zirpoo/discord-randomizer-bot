import "reflect-metadata";
import { createConnection } from "typeorm";
import chalk from "chalk";
import { databaseConfig } from "./config";
import { initLists } from "../commands/lists";

export async function createDatabase() {
    return createConnection(databaseConfig)
        .then(async db => {
            console.log(`${chalk.bgMagenta(" Database ")} Connected`);
            await initLists(db);
            return db;
        })
        .catch(error => console.log(error));
}
