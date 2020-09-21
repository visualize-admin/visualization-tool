#!/usr/bin/env node
const parseConnectionString = require("pg-connection-string").parse;
const { createDb, migrate } = require("postgres-migrations");
const path = require("path");

if (!process.env.DATABASE_URL) {
  console.log("No DATABASE_URL env var specified. Skipping DB migrations.");
  process.exit(0);
}

const pgConfig = parseConnectionString(process.env.DATABASE_URL);
pgConfig.port = +pgConfig.port;

const run = async () => {
  try {
    console.log("[ db-migrate ] Starting DB migration ...");

    await createDb(pgConfig.database, pgConfig);
  } catch {
    // Ignore DB creation errors. If it does not already exist, the following step will fail with a proper error.
  }

  try {
    await migrate(pgConfig, path.resolve(__dirname, "..", "db-migrations"));

    console.log("[ db-migrate ] DB migration complete!");
  } catch (e) {
    // Just log without stack trace
    console.log(
      "[ db-migrate ] DB migration failed. Please check your DATABASE_URL and if Postgres is running."
    );
    console.error(e.message);
    process.exit(1);
  }
};

run().catch((e) => {
  console.log("[ db-migrate ] Something unexpected happened");

  console.error(e);
  process.exit(1);
});
