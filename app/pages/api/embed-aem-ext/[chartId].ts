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
        console.log("AEM CMS Req header (accept-language):", headers["accept-language"]);
        console.log("AEM CMS Req header (accepted-language):", headers["accepted-language"]);
        console.log("AEM CMS Req header (Accepted-Language):", headers["Accepted-Language"]);
        
        const locale = parseLocaleString(headers["accepted-language"]?.toString() ?? "");

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
