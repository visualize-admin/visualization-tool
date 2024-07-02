import { NextApiRequest, NextApiResponse } from "next";

/**
 * Endpoint to get env variables client-side
 */
export default async function clientEnvApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const result = `window.__clientEnv__=${JSON.stringify({
          GA_TRACKING_ID: process.env.GA_TRACKING_ID,
          ENDPOINT: process.env.ENDPOINT,
          WHITELISTED_DATA_SOURCES:
            process.env.WHITELISTED_DATA_SOURCES !== undefined
              ? JSON.parse(process.env.WHITELISTED_DATA_SOURCES)
              : ["Prod"],
          SPARQL_GEO_ENDPOINT: process.env.SPARQL_GEO_ENDPOINT,
          SQL_ENDPOINT: process.env.SQL_ENDPOINT,
          PUBLIC_URL: process.env.PUBLIC_URL,
          GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
          ADFS_PROFILE_URL: process.env.ADFS_PROFILE_URL,
        })}`;

        if (result) {
          res.setHeader(
            "Content-Type",
            "application/javascript; charset=UTF-8"
          );
          res.status(200).send(result);
        } else {
          res.status(404).send("Not found.");
        }
      } catch (e) {
        console.error(e);
        res.status(500).json("Something went wrong!");
      }

      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
