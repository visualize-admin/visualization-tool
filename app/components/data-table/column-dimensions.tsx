import { Box, Button, Text } from "@theme-ui/components";
import * as React from "react";
import { GROUPED_COLOR } from "../../pages/[locale]/_table-a";
import { ButtonNone } from "./button-none";

export const ColumnDimension = React.memo(
  ({
    groupingIds,
    displayedColumns,
    activeColumn,
    setActiveColumn,
    hiddenIds,
  }: {
    groupingIds: string[];
    displayedColumns: string[];
    activeColumn: string;
    setActiveColumn: (x: string) => void;
    hiddenIds: string[];
  }) => {
    console.log(groupingIds);
    return (
      <>
        {groupingIds.length > 0 ? (
          <>
            {groupingIds.map((dim, i) => (
              <Button
                variant="outline"
                onClick={() => setActiveColumn(dim)}
                sx={{
                  width: ["100%", "100%", "100%"],
                  textAlign: "left",
                  mb: 3,
                  bg: GROUPED_COLOR,
                }}
              >
                <Box sx={{ color: "gray" }}>{`Column ${i + 1}`}</Box>
                <Box>{`${dim}`}</Box>
              </Button>
            ))}
          </>
        ) : (
          <ButtonNone />
        )}
        <Text sx={{ mt: 2, mb: 1 }} variant="heading3">
          Columns
        </Text>
        {displayedColumns
          .filter((dim) => !groupingIds.includes(dim.accessor))
          .map((dim, i) => {
            return (
              <Button
                variant="outline"
                onClick={() => setActiveColumn(dim.accessor)}
                sx={{
                  width: ["100%", "100%", "100%"],
                  textAlign: "left",
                  mb: 3,
                  bg:
                    dim.accessor === activeColumn
                      ? "primaryLight"
                      : "monochrome000",
                  ":hover": {
                    bg:
                      dim.accessor === activeColumn
                        ? "primaryLight"
                        : "monochrome300",
                  },
                }}
              >
                <Box sx={{ color: "gray" }}>{`Column ${
                  groupingIds.length + i + 1
                }`}</Box>
                <Box>{`${dim.Header}`}</Box>
              </Button>
            );
          })}

        <Text sx={{ mt: 2, mb: 1 }} variant="heading3">
          Hide & filter (Columns)
        </Text>

        {hiddenIds.length > 0 ? (
          <>
            {displayedColumns
              .filter((dim) => hiddenIds.includes(dim.accessor))
              .map((dim, i) => (
                <Button
                  variant="outline"
                  onClick={() => setActiveColumn(dim.accessor)}
                  sx={{
                    width: ["100%", "100%", "100%"],
                    textAlign: "left",
                    mb: 3,
                  }}
                >
                  <Box sx={{ color: "gray" }}>{`Column ${i + 1}`}</Box>
                  <Box>{`${dim.Header}`}</Box>
                </Button>
              ))}
          </>
        ) : (
          <ButtonNone />
        )}
      </>
    );
  }
);
