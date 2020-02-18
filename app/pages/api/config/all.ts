import { NextApiRequest, NextApiResponse } from "next";
import { getAllConfigs } from "../../../db/config";

/**
 * Endpoint to read configuration from
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        console.time("allconfigs")
        const result = await getAllConfigs();
        console.timeEnd("allconfigs")

        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: "Not found." });
        }
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
