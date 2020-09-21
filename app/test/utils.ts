import * as fs from "fs-extra";
import * as path from "path";

// Needs to be relative to CWD because webpack will replace __dirname with "/"
const FIXTURES_DIR = path.join("app", "test", "__fixtures", "dev");

export const loadFixtureConfigIds = async () => {
  const configFiles = await fs.readdir(FIXTURES_DIR);
  return configFiles.map((f) => path.basename(f, ".json"));
};

export const loadFixtureConfigIdsSync = () => {
  const configFiles = fs.readdirSync(FIXTURES_DIR);
  return configFiles.map((f) => path.basename(f, ".json"));
};

export const loadFixtureConfig = async (id: string) => {
  return fs.readJson(path.join(FIXTURES_DIR, `${id}.json`));
};
