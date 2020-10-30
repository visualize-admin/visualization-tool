import { SystemStyleObject } from "@styled-system/css";
import { Box, Flex } from "@theme-ui/components";
import * as React from "react";
import { Cell, Row } from "react-table";
import { Observation } from "../../domain/data";
import { Icon } from "../../icons";
import { useChartState } from "../shared/use-chart-state";
import { CellContent, Tag } from "./cell";
import { TableChartState } from "./table-state";

export const GroupHeader = ({ row }: { row: Row<Observation> }) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;
  return (
    <>
      {row.cells.map((cell, i) => {
        const {
          type,
          textStyle,
          textColor,
          columnColor,
          colorScale,
        } = tableColumnsMeta[i];
        return (
          <>
            {cell.isGrouped && type === "category" ? (
              <GroupTagCell
                row={row}
                cell={cell}
                fontWeight={textStyle}
                tagColor={colorScale ? colorScale(cell.value) : "primaryLight"}
              />
            ) : cell.isGrouped && type === "text" ? (
              <GroupTextCell
                row={row}
                cell={cell}
                styles={{
                  color: textColor,
                  bg: columnColor,
                  textAlign: typeof cell.value === "number" ? "right" : "left",
                  fontWeight: textStyle,
                }}
              />
            ) : cell.isAggregated ? (
              <PlaceceholderCell>aggregated</PlaceceholderCell>
            ) : cell.isPlaceholder ? ( // Nothing to display
              // Nothing to display
              <PlaceceholderCell>placeholder</PlaceceholderCell>
            ) : (
              // Nothing to display
              <PlaceceholderCell>nothing</PlaceceholderCell>
            )}
          </>
        );
      })}
    </>
  );
};

const PlaceceholderCell = ({ children }: { children?: React.ReactNode }) => (
  <Box as="td" sx={{ borderBottom: 0, fontSize: "6px" }}>
    {children}
  </Box>
);
const GroupTextCell = ({
  row,
  cell,
  styles,
}: {
  row: Row<Observation>;
  cell: Cell<Observation>;
  styles: SystemStyleObject;
}) => {
  return (
    <Flex
      as="td"
      sx={{ ...styles, width: "max-content" }}
      {...row.getToggleRowExpandedProps()}
      {...cell.getCellProps()}
    >
      <Box as="span" sx={{ width: 24, mr: 2, color: "monochrome600" }}>
        <Icon name={row.isExpanded ? "chevrondown" : "chevronup"} />
      </Box>
      {cell.render("Cell")}
    </Flex>
  );
};
const GroupTagCell = ({
  row,
  cell,
  fontWeight,
  tagColor,
}: {
  row: Row<Observation>;
  cell: Cell<Observation>;
  fontWeight: string;
  tagColor?: string;
}) => {
  return (
    <Flex
      as="td"
      sx={{ fontWeight, width: "auto" }}
      {...row.getToggleRowExpandedProps()}
      {...cell.getCellProps()}
    >
      <Box sx={{ width: 24, mr: 2, color: "monochrome600" }}>
        <Icon name={row.isExpanded ? "chevrondown" : "chevronup"} />
      </Box>

      <Tag tagColor={tagColor || "primaryLight"}>{cell.render("Cell")}</Tag>
    </Flex>
  );
};
