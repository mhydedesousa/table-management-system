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
  // throw new Error("ehllo");
  return (
    await pool.query(
      `SELECT column_name, data_type, character_maximum_length, column_default, is_nullable from INFORMATION_SCHEMA.COLUMNS where table_name = '${name}'`
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
