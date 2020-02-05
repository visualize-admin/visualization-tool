import { NextApiRequest, NextApiResponse } from "next";
import { DataCubeEntryPoint, DataCube } from "@zazuko/query-rdf-data-cube";
import HttpsProxyAgent from "https-proxy-agent";
import { SPARQL_ENDPOINT } from "../../domain/env";
import { locales } from "../../locales/locales";

let proxyAgent;
if (process.env.HTTPS_PROXY) {
  proxyAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
}

const entry = new DataCubeEntryPoint(SPARQL_ENDPOINT, {
  languages: [...locales],
  fetcher: {
    fetchOptions: {
      agent: proxyAgent,
      method: "POST",
      headers: {
        Accept: "application/sparql-results+json",
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }
    }
  },
  extraMetadata: [
    {
      variable: "contact",
      iri: "https://pcaxis.described.at/contact",
      multilang: true
    },
    {
      variable: "source",
      iri: "https://pcaxis.described.at/source",
      multilang: true
    },
    {
      variable: "survey",
      iri: "https://pcaxis.described.at/survey",
      multilang: true
    },
    {
      variable: "database",
      iri: "https://pcaxis.described.at/database",
      multilang: true
    },
    {
      variable: "unit",
      iri: "https://pcaxis.described.at/unit",
      multilang: true
    },
    {
      variable: "note",
      iri: "https://pcaxis.described.at/note",
      multilang: true
    },
    {
      variable: "dateCreated",
      iri: "http://schema.org/dateCreated",
      multilang: false
    },
    { variable: "dateModified", iri: "http://schema.org/dateModified" },
    {
      variable: "description",
      iri: "http://www.w3.org/2000/01/rdf-schema#comment",
      multilang: true
    }
  ]
});

const mkTimeout = async (ms = 0) => {
  return new Promise<DataCube[]>((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error("Timed out in " + ms + "ms."));
    }, ms);
  });
};

/**
 * Endpoint to write configuration to.
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const result = await Promise.race([
          mkTimeout(10000),
          entry.dataCubes()
        ]);

        res.status(200).json(result.map(cb => cb.iri));
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message ?? "Something went wrong!" });
      }

      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
