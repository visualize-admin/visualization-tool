// @ts-nocheck
import { Box, Flex, Label, Radio, Select, Text } from "@theme-ui/components";
import * as React from "react";
import { ColorPickerMenu } from "../chart-controls/color-picker";
import { getPalette } from "../../domain/helpers";
import { scaleOrdinal } from "d3-scale";

const bafuColors = [
  "#F9C16E",
  "#F38B3C",
  "#375172",
  "#62A8E5",
  "#32B8DF",
  "#008F85",
  "#6ECD9C",
  "#93B479",
  "#C97146",
  "#8D5A54",
  "#FFFFFF",
  "#F5F5F5",
  "#CCCCCC",
  "#757575",
  "#454545",
  "#333333",
  "#000000",
];

export type ColumnStyle = {
  id: string;
  dimensionType: string;
  style: string;
  textStyle: "regular" | "bold";
  textColor: string;
  columnColor: string;
  barColor: string;
  barBackground: string;
  barScale: $FixMe;
  colorRange: $FixMe;
  domain: $FixMe;
};

export const ColumnFormatting = React.memo(
  ({
    activeColumn,
    columnStyles,
    updateColumnStyle,
  }: {
    activeColumn: string;
    columnStyles: ColumnStyle[];
    updateColumnStyle: $FixMe;
  }) => {
    const options =
      columnStyles.find((c) => c.id === activeColumn).dimensionType === "number"
        ? ["text", "heatmap", "bar"]
        : ["text", "category"];
    return (
      <>
        <Text variant="heading3" sx={{ mt: 5, mx: 3, mb: 2 }}>
          Spalten Formatierung
        </Text>
        Visualisierungsstil
        <Select
          sx={{ mx: 3, my: 2, p: 3 }}
          value={
            columnStyles.find((c) => c.id === activeColumn) &&
            columnStyles.find((c) => c.id === activeColumn).style
          }
          onChange={(e) =>
            updateColumnStyle({
              columnId: activeColumn,
              style: e.currentTarget.value,
              property: "style",
              value: e.currentTarget.value,
            })
          }
        >
          {options.map((o) => (
            <option value={o}>{o}</option>
          ))}
        </Select>
        {/* Category */}
        {columnStyles.find((c) => c.id === activeColumn) &&
          columnStyles.find((c) => c.id === activeColumn).style ===
            "category" && (
            <>
              <FontWeightFormatting
                activeColumn={activeColumn}
                columnStyles={columnStyles}
                updateColumnStyle={updateColumnStyle}
              />
              Kategorical Farben
              <Select
                sx={{ mx: 3, my: 2, p: 3 }}
                onChange={(e) =>
                  updateColumnStyle({
                    columnId: activeColumn,
                    style: "category",
                    property: "colorRange",
                    value: scaleOrdinal().range(
                      getPalette(getPalette(e.currentTarget.value))
                    ),
                  })
                }
              >
                <option value="accent">accent</option>
                <option value="category10">category10</option>
                <option value="set1">set1</option>
              </Select>
            </>
          )}
        {/* Heatmap */}
        {columnStyles.find((c) => c.id === activeColumn) &&
          columnStyles.find((c) => c.id === activeColumn).style ===
            "heatmap" && (
            <>
              <FontWeightFormatting
                activeColumn={activeColumn}
                columnStyles={columnStyles}
                updateColumnStyle={updateColumnStyle}
              />
              Kategorical Farben
              <Select
                sx={{ mx: 3, my: 2, p: 3 }}
                disabled
                onChange={(e) =>
                  updateColumnStyle({
                    columnId: activeColumn,
                    style: "heatmap",
                    property: "colorRange",
                    value: scaleLinear().range(
                      getPalette(getPalette(e.currentTarget.value))
                    ),
                  })
                }
              >
                <option value="one">one</option>
              </Select>
            </>
          )}
        {/* Bars */}
        {columnStyles.find((c) => c.id === activeColumn) &&
          columnStyles.find((c) => c.id === activeColumn).style === "bar" && (
            <>
              <FontWeightFormatting
                activeColumn={activeColumn}
                columnStyles={columnStyles}
                updateColumnStyle={updateColumnStyle}
              />
              <Flex
                sx={{
                  mx: 3,
                  my: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Farbe:
                <ColorPickerMenu
                  selectedColor={
                    columnStyles.find((d) => d.id === activeColumn) &&
                    columnStyles.find((d) => d.id === activeColumn).barColor
                      ? columnStyles.find((d) => d.id === activeColumn).barColor
                      : "#333333"
                  }
                  colors={bafuColors}
                  onChange={(c) =>
                    updateColumnStyle({
                      columnId: activeColumn,
                      style: "bar",
                      property: "barColor",
                      value: c,
                    })
                  }
                />
              </Flex>
              <Flex
                sx={{
                  mx: 3,
                  my: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Hintergrund Farbe:
                <ColorPickerMenu
                  selectedColor={
                    columnStyles.find((d) => d.id === activeColumn) &&
                    columnStyles.find((d) => d.id === activeColumn)
                      .barBackground
                      ? columnStyles.find((d) => d.id === activeColumn)
                          .barBackground
                      : "#ffffff"
                  }
                  colors={bafuColors}
                  onChange={(c) =>
                    updateColumnStyle({
                      columnId: activeColumn,
                      style: "bar",
                      property: "barBackground",
                      value: c,
                    })
                  }
                />
              </Flex>
            </>
          )}
        {/* Text */}
        {columnStyles.find((c) => c.id === activeColumn) &&
          columnStyles.find((c) => c.id === activeColumn).style === "text" && (
            <>
              <FontWeightFormatting
                activeColumn={activeColumn}
                columnStyles={columnStyles}
                updateColumnStyle={updateColumnStyle}
              />
              <Flex
                sx={{
                  mx: 3,
                  my: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Text Farbe:
                <ColorPickerMenu
                  selectedColor={
                    columnStyles.find((d) => d.id === activeColumn) &&
                    columnStyles.find((d) => d.id === activeColumn).textColor
                      ? columnStyles.find((d) => d.id === activeColumn)
                          .textColor
                      : "#333333"
                  }
                  colors={bafuColors}
                  onChange={(c) =>
                    updateColumnStyle({
                      columnId: activeColumn,
                      style: "text",
                      property: "textColor",
                      value: c,
                    })
                  }
                />
              </Flex>
              <Flex
                sx={{
                  mx: 3,
                  my: 2,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Spalte Farbe:
                <ColorPickerMenu
                  selectedColor={
                    columnStyles.find((d) => d.id === activeColumn) &&
                    columnStyles.find((d) => d.id === activeColumn).columnColor
                      ? columnStyles.find((d) => d.id === activeColumn)
                          .columnColor
                      : "#ffffff"
                  }
                  colors={bafuColors}
                  onChange={(c) =>
                    updateColumnStyle({
                      columnId: activeColumn,
                      style: "text",
                      property: "columnColor",
                      value: c,
                    })
                  }
                />
              </Flex>
            </>
          )}
      </>
    );
  }
);

const FontWeightFormatting = ({
  activeColumn,
  columnStyles,
  updateColumnStyle,
}: {
  activeColumn: string;
  columnStyles: ColumnStyle[];
  updateColumnStyle: $FixMe;
}) => {
  return (
    <Box sx={{ mx: 3, my: 2 }}>
      Schriftgewicht:
      <Flex sx={{ mx: 3, my: 2 }}>
        <Label>
          <Radio
            disabled={!columnStyles.map((d) => d.id).includes(activeColumn)}
            name="regular"
            value="regular"
            checked={
              columnStyles.find((d) => d.id === activeColumn) &&
              columnStyles.find((d) => d.id === activeColumn).textStyle ===
                "regular"
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
            disabled={!columnStyles.map((d) => d.id).includes(activeColumn)}
            name="bold"
            value="bold"
            checked={
              columnStyles.find((d) => d.id === activeColumn) &&
              columnStyles.find((d) => d.id === activeColumn).textStyle ===
                "bold"
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
  );
};
