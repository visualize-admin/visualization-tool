import { NextApiRequest, NextApiResponse } from "next";
import { getCubes } from "../../rdf/queries";

/**
 * Endpoint to write configuration to.
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const result = await getCubes({ locale: "de" });

        // TODO: Make this 201 and set final URI as Location header
        res.status(200).json(result);
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
