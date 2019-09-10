import { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../lib/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case "POST":
      const result = await query(`SELECT * from config`);

      res.status(200).json({
        answer: `You said "${req.body.message}".`,
        result: result ? result.rows : []
      });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
