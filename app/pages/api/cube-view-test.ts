import { NextApiRequest, NextApiResponse } from "next";
import { getCubeDimensions, getCubes } from "../../rdf/queries";

/**
 * Endpoint to write configuration to.
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const locale = "de";
        const result = await getCubes({ locale, includeDrafts: true });

        const cubesWithDimensions = result.map(({ cube, locale, data }) => {
          return {
            ...data,
            dimensions: getCubeDimensions({ cube, locale }).map(
              ({ data }) => data
            ),
          };
        });

        // TODO: Make this 201 and set final URI as Location header
        res.status(200).json(cubesWithDimensions);
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Something went wrong!" });
      }

      break;
    default:
      res.setHeader("Allow", ["GET"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
