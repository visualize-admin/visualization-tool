import nanoid from "nanoid";
import { pool } from "../lib/db";

export const createConfig = async (data: any): Promise<{ key: string }> => {
  const result = await pool.query<{ key: string }>(
    `INSERT INTO config(key, data) VALUES ($1, $2) RETURNING key`,
    [nanoid(12), data]
  );

  if (result.rows.length < 1) {
    throw Error("No result after insert!");
  }

  return result.rows[0];
};

export const getConfig = async (
  key: string
): Promise<undefined | { key: string; data: any }> => {
  const result = await pool.query<{ key: string; data: any }>(
    `SELECT key, data FROM config WHERE key = $1 LIMIT 1`,
    [key]
  );

  return result.rows[0];
};
