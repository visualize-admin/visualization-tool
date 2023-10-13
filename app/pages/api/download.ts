import { Workbook } from "exceljs";
import { NextApiRequest, NextApiResponse } from "next";

import { FileFormat } from "../../components/data-download";
import { Observation } from "../../domain/data";

export default async function Download(
  req: Omit<NextApiRequest, "body"> & {
    body: {
      columnKeys: string[];
      data: Observation[];
      fileFormat: FileFormat;
    };
  },
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const { columnKeys, data, fileFormat } = req.body;
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet("data");
        worksheet.columns = columnKeys.map((d) => ({
          header: d,
          key: d,
        }));
        worksheet.addRows(data);

        switch (fileFormat) {
          case "csv":
            await workbook.csv.write(res, { sheetId: worksheet.id });
            break;
          case "xlsx":
            await workbook.xlsx.write(res);
            break;
        }

        res.status(200);
        res.end();
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Something went wrong!" });
      }

      break;
    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1024mb",
    },
    reponseLimit: false,
  },
};
