import { NextApiRequest, NextApiResponse } from "next";

import { getEmbedParamsFromQuery } from "@/components/embed-params";

import { renderEmbedMarkup } from "../../../../embed-templates/embed-aem-ext";
import { parseLocaleString } from "../../../../locales/locales";

/**
 * Endpoint to get embed HTML from
 */
const route = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;
  switch (method) {
    case "GET":
      try {
        const chartId = query.chartId as string;
        const locale = parseLocaleString(query.locale?.toString());
        const embedQueryParams = getEmbedParamsFromQuery(query);

        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res
          .status(200)
          .send(renderEmbedMarkup({ locale, chartId, embedQueryParams }));
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

export default route;
