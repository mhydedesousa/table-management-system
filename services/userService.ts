import { pool } from "../pools/dbPool";

export const getUsers = async () => {
  // throw new Error("ehllo");
  return (await pool.query("SELECT * FROM users ORDER BY id ASC")).rows;
};
