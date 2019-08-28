import { NextApiRequest, NextApiResponse } from "next";

export default (req: NextApiRequest, res: NextApiResponse) => {
  const { headers, method } = req;

  console.log(headers);

  switch (method) {
    case "POST":
      console.log(req.body.message);
      res.status(200).json({ answer: `You said "${req.body.message}".` });
      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
