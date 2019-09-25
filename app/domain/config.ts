import { pool } from "../lib/db";
import { createChartId } from "./chart-id";

export const createConfig = async (data: any): Promise<{ key: string }> => {
  const result = await pool.query<{ key: string }>(
    `INSERT INTO config(key, data) VALUES ($1, $2) RETURNING key`,
    [createChartId(), data]
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
