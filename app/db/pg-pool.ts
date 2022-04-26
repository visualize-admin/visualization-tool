import { Pool } from "pg";

import { DATABASE_URL } from "../domain/env";

export const pool = new Pool({
  connectionString: DATABASE_URL,
});
