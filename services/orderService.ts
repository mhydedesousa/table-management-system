import { pool } from "../pools/dbPool";

export const getOrders = async () => {
  // throw new Error("ehllo");
  return (await pool.query("SELECT * FROM orders ORDER BY id ASC")).rows;
};
