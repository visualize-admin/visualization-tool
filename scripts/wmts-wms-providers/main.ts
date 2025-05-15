import * as fs from "fs";
import * as path from "path";

const normalizeUrl = (url: string): string => {
  // remove trailing ?
  // remove request parameters
  return url.split("?")[0].split("#")[0].trim();
};

async function fetchAllowList() {
  /** fetches https://rdataflow.github.io/WMS-monitor/result.txt & https://rdataflow.github.io/WTMS-monitor/result.txt */
  const urls = ["https://rdataflow.github.io/WMTS-WMS-monitor/result.json"];
  const results = await Promise.all(
    urls.map((url) => fetch(url).then((x) => x.json()))
  );
  return new Set(
    results
      .flat()
      .filter((x) => x.trim() !== "")
      .map((x) => normalizeUrl(x.trim()))
  );
}

// Function to read and filter the repository providers JSON file
function filterProviders(providers: string[], allowList: Set<string>): any[] {
  try {
    const filteredProviders = providers.filter(
      (provider: any) => provider && allowList.has(normalizeUrl(provider))
    );

    return filteredProviders;
  } catch (error) {
    console.error(`Error processing JSON file: ${error}`);
    process.exit(1);
  }
}

// Main function
async function main() {
  const initialProvidersPath = path.join(
    __dirname,
    "../../",
    "./app/charts/map/initial-wms-wmts-providers.json"
  );

  const providersPath = path.join(
    __dirname,
    "../../",
    "./app/charts/map/wms-wmts-providers.json"
  ); // Path to your JSON file

  // Read the allow list and create a Set
  const allowList = await fetchAllowList();
  console.log(`Loaded ${allowList.size} allowed URLs`);

  // Filter the providers
  const jsonContent = fs.readFileSync(initialProvidersPath, "utf-8");
  const providers = JSON.parse(jsonContent);
  console.log(`Loaded ${providers.length} providers from JSON file`);
  const filteredProviders = filterProviders(providers, allowList);
  console.log(
    `Filtered ${filteredProviders.length} providers from the JSON file`
  );

  // Write the result to a new file
  fs.writeFileSync(providersPath, JSON.stringify(filteredProviders, null, 2));
  console.log(`Filtered providers saved to ${providersPath}`);
}

// Execute the main function
main()
  .then((x) => {
    console.log("Done");
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
