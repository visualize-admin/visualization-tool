// @ts-nocheck
import {
  Text,
  Flex,
  Label,
  Checkbox,
  Radio,
  Select,
} from "@theme-ui/components";
import * as React from "react";

export const ColumnSorting = React.memo(
  ({
    activeColumn,
    sortingIds,
    updateSortingIds,
    updateSortingDirection,
    updateSortingOrder,
  }: {
    activeColumn: string;
    sortingIds: { id: string; desc: boolean }[];
    updateSortingIds: (columnId: string) => void;
    updateSortingDirection: (columnId: string, desc: boolean) => void;
    updateSortingOrder: (
      columnId: string,
      oldPosition: number,
      newPosition: number
    ) => void;
  }) => {
    return (
      <>
        <Text variant="heading3" sx={{ mt: 5, mx: 3, mb: 2 }}>
          Sortieren
        </Text>
        {/* <Label sx={{ mx: 3, my: 2 }}>
          <Checkbox
            checked={sortingIds.map((d) => d.id).includes(activeColumn)}
            onClick={() => updateSortingIds(activeColumn)}
          />
          Sortiert
        </Label> */}
        <Text
          variant="paragraph2"
          sx={{ color: "monochrome700", mt: 2, mx: 3 }}
        >
          Sorting Priority
        </Text>
        <Select
          sx={{ mx: 3, my: 2, p: 3 }}
          value={sortingIds.findIndex((c) => c.id === activeColumn)}
          onChange={(e) =>
            updateSortingOrder(
              activeColumn,
              sortingIds.findIndex((c) => c.id === activeColumn),
              +e.currentTarget.value
            )
          }
        >
          {sortingIds.map((id, i) => (
            <option value={i}>{`${i + 1}`}</option>
          ))}
        </Select>
        <Text
          variant="paragraph2"
          sx={{ color: "monochrome700", mt: 2, mx: 3 }}
        >
          Sorting Direction
        </Text>
        <Flex sx={{ mx: 3, mb: 2 }}>
          <Label
            sx={{
              color: !sortingIds.map((d) => d.id).includes(activeColumn)
                ? "monochrome300"
                : "monochrome900",
            }}
          >
            <Radio
              disabled={!sortingIds.map((d) => d.id).includes(activeColumn)}
              name="ascending"
              value="ascending"
              checked={
                sortingIds.find((d) => d.id === activeColumn) &&
                sortingIds.find((d) => d.id === activeColumn).desc === false
              }
              onClick={(e) => updateSortingDirection(activeColumn, false)}
            />
            1 → 9
          </Label>
          <Label
            sx={{
              color: !sortingIds.map((d) => d.id).includes(activeColumn)
                ? "monochrome300"
                : "monochrome900",
            }}
          >
            <Radio
              disabled={!sortingIds.map((d) => d.id).includes(activeColumn)}
              name="descending"
              value="descending"
              checked={
                sortingIds.find((d) => d.id === activeColumn) &&
                sortingIds.find((d) => d.id === activeColumn).desc
              }
              onClick={(e) => updateSortingDirection(activeColumn, true)}
            />
            9 → 1
          </Label>
        </Flex>
      </>
    );
  }
);
