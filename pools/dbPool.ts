import * as pg from "pg";
import config from "../config";
const { Pool } = pg;
export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "table-management",
  password: config.DATABASE_PASSWORD,
  port: 5432,
});
