import { table } from "console";
import { pool } from "../pools/dbPool";
import bcrypt from "bcryptjs";

export const getTables = async () => {
  // throw new Error("ehllo");
  return (
    await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`
    )
  ).rows.map((x) => x.table_name);
};

export const getTableSchema = async (name: string) => {
  return (
    await pool.query(
      `SELECT
          cols.column_name,
          cols.data_type,
          cols.is_nullable,
          fk.referenced_table_name,
          fk.referenced_column_name
      FROM
          information_schema.columns AS cols
          LEFT JOIN (
              SELECT
                  conname AS constraint_name,
                  conrelid::regclass::text AS table_name,
                  a.attname AS column_name,
                  confrelid::regclass::text AS referenced_table_name,
                  b.attname AS referenced_column_name
              FROM
                  pg_constraint AS c
                  JOIN pg_attribute AS a ON c.conrelid = a.attrelid AND a.attnum = ANY(c.conkey)
                  JOIN pg_attribute AS b ON c.confrelid = b.attrelid AND b.attnum = ANY(c.confkey)
              WHERE
                  confrelid != 0::oid
                  AND contype = 'f'
          ) AS fk ON cols.table_name = fk.table_name AND cols.column_name = fk.column_name
      WHERE
          cols.table_name = '${name}';`
    )
  ).rows;
};

export const getTableData = async (name: string) => {
  // throw new Error("ehllo");
  return (await pool.query(`SELECT * FROM ${name}`)).rows;
};

export const deleteFromTable = async (name: string, id: string) => {
  return await pool.query(`DELETE FROM ${name} WHERE id='${id}'`);
};

export const insertIntoTable = async (name: string, body: any) => {
  const columns = [];
  const values = [];
  for (const key of Object.keys(body)) {
    columns.push(key);
    let val = body[key];
    if (key === "password") val = await bcrypt.hash(val, 8);
    values.push(`'${val}'`);
  }
  console.log(columns);
  console.log(values);
  return (
    await pool.query(
      `INSERT INTO ${name} (${columns.join(", ")}) 
      VALUES (${values.join(", ")})`
    )
  ).rows;
};
