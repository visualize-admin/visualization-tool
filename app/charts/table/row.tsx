import { Box, Flex, Text } from "@theme-ui/components";
import * as React from "react";
import { Cell, Row } from "react-table";
import { Observation } from "../../domain/data";
import { useChartState } from "../shared/use-chart-state";
import { CellContent } from "./cell";
import { GroupHeader } from "./group-header";
import { ColumnMeta, TableChartState } from "./table-state";
import { Tag } from "./cell";
import { ReactNode } from "react";

export const RowUI = ({
  row,
  prepareRow,
}: {
  row: Row<Observation>;
  prepareRow: (row: Row<Observation>) => void;
}) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;

  prepareRow(row);
  return (
    <>
      <tr {...row.getRowProps()}>
        {row.subRows.length === 0 ? (
          <>
            {row.cells.map((cell, i) => {
              return (
                <CellContent cell={cell} columnMeta={tableColumnsMeta[i]}>
                  {cell.render("Cell")}
                </CellContent>
              );
            })}
          </>
        ) : (
          <GroupHeader row={row} />
        )}
      </tr>
      {/* Display rows within a group by recursively calling RowUI  */}
      {/* {row.subRows.length > 0 &&
        row.subRows.map((subRow) => {
          return <RowUI row={subRow} prepareRow={prepareRow} />;
        })} */}
    </>
  );
};

export const RowMobile = ({
  row,
  prepareRow,
}: {
  row: Row<Observation>;
  prepareRow: (row: Row<Observation>) => void;
}) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;

  prepareRow(row);
  console.log("row mobile", row);
  const headingLevel = row.depth === 0 ? "h2" : row.depth === 1 ? "h3" : "p";
  return (
    <Box>
      {row.subRows.length === 0 ? (
        row.cells.map((cell, i) => {
          return (
            <Flex
              as="dl"
              sx={{
                color: "monochrome800",
                fontSize: 2,
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                my: 2,
                "&:first-of-type": {
                  pt: 2,
                },
                "&:last-of-type": {
                  borderBottom: "1px solid",
                  borderBottomColor: "monochrome400",
                  pb: 3,
                },
              }}
            >
              <Box as="dt" sx={{ flex: "1 1 100%", fontWeight: "bold", mr: 1 }}>
                {cell.column.Header}
              </Box>
              <Box as="dd" sx={{ flex: "1 1 100%", ml: 1 }}>
                <DDContent cell={cell} columnMeta={tableColumnsMeta[i]}>
                  {" "}
                  {cell.render("Cell")}
                </DDContent>
              </Box>
            </Flex>
          );
        })
      ) : (
        // Group
        <>
          <Text
            as={headingLevel}
            variant="paragraph1"
            sx={{ ml: `${row.depth * 12}px` }}
          >
            {`${row.groupByID}: ${row.groupByVal}`}
          </Text>
          {/* Display rows within a group by recursively calling RowMobile  */}
          {row.subRows.length > 0 &&
            row.subRows.map((subRow) => {
              return <RowMobile row={subRow} prepareRow={prepareRow} />;
            })}
        </>
      )}
    </Box>
  );
};

const DDContent = ({
  cell,
  columnMeta,
  children,
}: {
  cell: Cell<Observation>;
  columnMeta: ColumnMeta;
  children: ReactNode;
}) => {
  const {
    type,
    textStyle,
    textColor,
    columnColor,
    colorScale,
    barColorPositive,
    barColorNegative,
    barColorBackground,
    barShowBackground,
    widthScale,
  } = columnMeta;

  switch (type) {
    case "text":
      return (
        <Box
          as="div"
          sx={{
            width: "100%",
            color: textColor,
            bg: columnColor,
            textAlign: typeof cell.value === "number" ? "right" : "left",
            fontWeight: textStyle,
          }}
        >
          {children}
        </Box>
      );
    case "category":
      return (
        <Tag
          tagColor={colorScale ? colorScale(cell.value) : "primaryLight"}
          small
        >
          {children}
        </Tag>
      );
    default:
      return (
        <Box
          as="span"
          sx={{
            color: textColor,
            bg: columnColor,
            textAlign: typeof cell.value === "number" ? "right" : "left",
            fontWeight: textStyle,
          }}
        >
          {children}
        </Box>
      );
  }
};
