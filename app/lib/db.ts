import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const query = async (text: string, params?: any[]) => {
  try {
    const results = await pool.query(text, params);
    return results;
  } catch (e) {
    setImmediate(() => {
      throw e;
    });
  }
};
