import { Box, Button, Text, Flex } from "@theme-ui/components";
import * as React from "react";

export const moveColumn = (
  arr: $IntentionalAny[],
  from: number,
  to: number
) => {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, []);
};

export const ColumnReorderingArrows = React.memo(
  ({
    activeColumn,
    columnOrderIds,
    reorderColumns,
    disabled,
  }: {
    activeColumn: string;
    columnOrderIds: string[];
    reorderColumns: (currentPosition: number, newPosition: number) => void;
    disabled: boolean;
  }) => {
    const currentPosition = columnOrderIds.findIndex((d) => d === activeColumn);

    return (
      <Box sx={{ mt: 5, mx: 3 }}>
        <Text variant="heading3" sx={{ mb: 2 }}>
          Column position in the table
        </Text>
        <Flex>
          <Button
            variant="reset"
            sx={{
              pointerEvents:
                disabled || currentPosition === 0 ? "none" : "unset",
              mx: 2,
              color:
                disabled || currentPosition === 0 ? "monochrome400" : "primary",
            }}
            onClick={() => {
              reorderColumns(currentPosition, currentPosition - 1);
            }}
          >
            ⬅
          </Button>
          <Button
            variant="reset"
            sx={{
              pointerEvents:
                disabled || currentPosition === columnOrderIds.length - 1
                  ? "none"
                  : "unset",
              mx: 2,
              color:
                disabled || currentPosition === columnOrderIds.length - 1
                  ? "monochrome400"
                  : "primary",
            }}
            onClick={() => {
              reorderColumns(currentPosition, currentPosition + 1);
            }}
          >
            ⮕
          </Button>
        </Flex>
      </Box>
    );
  }
);
