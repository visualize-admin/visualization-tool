import { NextApiRequest, NextApiResponse } from "next";
import { renderEmbedMarkup } from "../../../embed-templates/embed-aem-ext";
import { parseLocaleString } from "../../../locales/locales";

/**
 * Endpoint to get embed HTML from
 */
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, headers, query } = req;

  switch (method) {
    case "GET":
      try {
        const chartId = query.chartId as string;
        console.log("Language from AEM Requested:", headers["accept-language"]);
        const locale = parseLocaleString(headers["accept-language"] || "");

        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res.status(200).send(renderEmbedMarkup({ locale, chartId }));
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
