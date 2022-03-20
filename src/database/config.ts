import { DataSourceOptions } from "typeorm";

export const databaseConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    ssl: { rejectUnauthorized: false },
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    synchronize: true,
    logging: false,
    entities: [__dirname + "/entities/**/*.{js,ts}"],
    migrations: [__dirname + "/migrations/**/*.{js,ts}"],
    subscribers: [__dirname + "/subscribers/**/*.{js,ts}"],
};
