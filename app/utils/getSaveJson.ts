import fs from "fs";

/**
 * Use this function to get a JSON file from the filesystem.
 * If the file doesn't exist, the function will return the `initialState`.
 */
export const getJSON = <T extends object>(
  filename: string,
  initialState: T
): T => {
  try {
    const file = fs.readFileSync(`${filename}.json`, "utf-8");

    if (file) {
      return JSON.parse(file) as T;
    }
  } catch (e) {
    console.log(`No file found for ${filename}.json. Creating new one!`);
  }

  return initialState;
};

/**
 * Use this function to save a JSON file to the filesystem.
 * 
 * @example
 * const data = getJSON("timeResults", {
    constructTime: 0,
    selectTime: 0,
    queryCount: 0,
  });
  data.constructTime += constructTime;
  data.selectTime += selectTime;
  data.queryCount++;
  saveJSON("timeResults", data);
 */
export const saveJSON = <T extends object>(filename: string, data: T) => {
  fs.writeFileSync(`${filename}.json`, JSON.stringify(data, null, 2), "utf-8");
};
