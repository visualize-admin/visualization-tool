// @ts-nocheck
import {
  Box,
  Button,
  Text,
  Flex,
  Label,
  Select,
  Checkbox,
  Radio,
} from "@theme-ui/components";
import * as React from "react";
export type ColumnStyle = {
  columnId: string;
  style: string;
  textStyle: "regular" | "bold";
};
export const ColumnFormatting = React.memo(
  ({
    activeColumn,
    columnStyles,
    updateColumnStyle,
  }: {
    activeColumn: string;
    columnStyles: ColumnStyle[];
    updateColumnStyle: (
      columnId: string,
      style: string,
      property: string,
      value: string
    ) => void;
  }) => {
    return (
      <>
        <Text variant="heading3" sx={{ mt: 5, mx: 3, mb: 2 }}>
          Spalten Formatierung
        </Text>
        <Select
          onChange={(e) =>
            updateColumnStyle({
              columnId: activeColumn,
              style: e.currentTarget.value,
              property: "textStyle",
              value: "regular",
            })
          }
        >
          <option value="text">Text</option>
          <option value="category">Kategorie</option>
        </Select>
        {columnStyles.find((c) => c.id === activeColumn) &&
          columnStyles.find((c) => c.id === activeColumn).style === "text" && (
            <Box sx={{ mx: 3, my: 2 }}>
              Schriftgewicht:
              <Flex sx={{ mx: 3, my: 2 }}>
                <Label>
                  <Radio
                    disabled={
                      !columnStyles.map((d) => d.id).includes(activeColumn)
                    }
                    name="regular"
                    value="regular"
                    checked={
                      columnStyles.find((d) => d.id === activeColumn) &&
                      columnStyles.find((d) => d.id === activeColumn)
                        .textStyle === "regular"
                    }
                    onClick={() =>
                      updateColumnStyle({
                        columnId: activeColumn,
                        style: "text",
                        property: "textStyle",
                        value: "regular",
                      })
                    }
                  />
                  Regular
                </Label>
                <Label>
                  <Radio
                    disabled={
                      !columnStyles.map((d) => d.id).includes(activeColumn)
                    }
                    name="bold"
                    value="bold"
                    checked={
                      columnStyles.find((d) => d.id === activeColumn) &&
                      columnStyles.find((d) => d.id === activeColumn)
                        .textStyle === "bold"
                    }
                    onClick={() =>
                      updateColumnStyle({
                        columnId: activeColumn,
                        style: "text",
                        property: "textStyle",
                        value: "bold",
                      })
                    }
                  />
                  Bold
                </Label>
              </Flex>
            </Box>
          )}
      </>
    );
  }
);
