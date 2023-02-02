import { NextApiRequest, NextApiResponse } from "next";

import { EmbedOptions } from "@/utils/embed";

import { renderEmbedMarkup } from "../../../../embed-templates/embed-aem-ext";
import { parseLocaleString } from "../../../../locales/locales";

const softParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
};

/**
 * Endpoint to get embed HTML from
 */
const route = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, query } = req;

  const embedOptions = softParse(query.embedOptions as string) as EmbedOptions;

  switch (method) {
    case "GET":
      try {
        const chartId = query.chartId as string;
        const locale = parseLocaleString(query.locale.toString());

        res.setHeader("Content-Type", "text/html; charset=UTF-8");
        res
          .status(200)
          .send(renderEmbedMarkup({ locale, chartId, embedOptions }));
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
