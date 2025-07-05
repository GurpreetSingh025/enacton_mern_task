// db.ts

import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";
import { Database } from "@/types/index";

// Optional: log env vars for debugging (remove later)
console.log("DB ENV:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const dialect = new MysqlDialect({
  pool: createPool({
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    connectionLimit: 999,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
