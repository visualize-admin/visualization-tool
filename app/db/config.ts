import { createChartId } from "../lib/create-chart-id";

import { pool } from "./pg-pool";

/**
 * Store data in the DB.
 * Do not try to use on client-side! Use /api/config instead.
 *
 * @param data Data to be stored as configuration
 */
export const createConfig = async (
  data: $Unexpressable
): Promise<{ key: string }> => {
  const result = await pool.query<{ key: string }>(
    `INSERT INTO config(key, data) VALUES ($1, $2) RETURNING key`,
    [createChartId(), data]
  );

  if (result.rows.length < 1) {
    throw Error("No result after insert!");
  }

  return result.rows[0];
};

/**
 * Get data from DB.
 * Do not try to use on client-side! Use /api/config instead.
 *
 * @param key Get data from DB with this key
 */
export const getConfig = async (
  key: string
): Promise<undefined | { key: string; data: $Unexpressable }> => {
  const result = await pool.query<{ key: string; data: $Unexpressable }>(
    `SELECT key, data FROM config WHERE key = $1 LIMIT 1`,
    [key]
  );

  return result.rows[0];
};

/**
 * Get all keys from DB.
 * Do not try to use on client-side! Use /api/config instead.
 *
 * @param key Get data from DB with this key
 */
export const getAllConfigs = async (): Promise<
  {
    key: string;
    data: $Unexpressable;
  }[]
> => {
  const result = await pool.query<{ key: string; data: $Unexpressable }>(
    `SELECT key,data FROM config ORDER BY created_at DESC`
  );

  return result.rows;
};
