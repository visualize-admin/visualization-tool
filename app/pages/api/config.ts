import { NextApiRequest, NextApiResponse } from "next";

import { createConfig } from "../../db/config";

/**
 * Endpoint to write configuration to.
 */
const route = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const result = await createConfig(req.body);

        // TODO: Make this 201 and set final URI as Location header
        res.status(200).json(result);
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Something went wrong!" });
      }

      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default route
