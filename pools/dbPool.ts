import * as pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "table-management",
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});
