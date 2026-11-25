import { Box, ButtonBase, getContrastRatio, useTheme } from "@mui/material";
import { Row } from "react-table";

import { useChartState } from "@/charts/shared/chart-state";
import { TableChartState } from "@/charts/table/table-state";
import { Tag } from "@/charts/table/tag";
import { Flex } from "@/components/flex";
import { Observation } from "@/domain/data";
import { FOCUS_OUTLINE_COLOR_VAR } from "@/federal-ci/components/common";
import { Icon } from "@/icons";
import { FOCUS_OUTLINE_COLOR, FOCUS_OUTLINE_INSET } from "@/themes/focus";

export const GroupHeader = ({
  row,
  groupingLevels,
  colSpan,
}: {
  row: Row<Observation>;
  groupingLevels: number;
  colSpan?: number;
}) => {
  const { tableColumnsMeta } = useChartState() as TableChartState;
  const theme = useTheme();
  const { depth } = row;
  // `allCells` so that group headers are shown even if the column is hidden.
  const groupedCell = row.allCells.find((cell) => cell.isGrouped);

  if (!groupedCell) {
    return null;
  }

  const colMeta = tableColumnsMeta[groupedCell.column.id];
  const { formatter } = colMeta;
  const bg = theme.palette.grey[getGroupLevelShade(groupingLevels - depth)];
  const textColor = theme.palette.getContrastText(bg);
  const ringColor =
    getContrastRatio(FOCUS_OUTLINE_COLOR, bg) < 3 ? textColor : undefined;
  const iconColor =
    getContrastRatio(theme.palette.grey[600], bg) < 3
      ? textColor
      : theme.palette.grey[600];
  const toggleRow = () => row.toggleRowExpanded();
  const toggle = (
    <ButtonBase
      aria-expanded={!!row.isExpanded}
      onClick={(e) => {
        e.stopPropagation();
        toggleRow();
      }}
      sx={{
        height: "100%",
        pr: 2,
        justifyContent: "flex-start",
        textAlign: "left",
        "&:focus-visible": FOCUS_OUTLINE_INSET,
        ...(ringColor && { [FOCUS_OUTLINE_COLOR_VAR]: ringColor }),
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{ display: "flex", width: 24, mr: 0, color: iconColor }}
      >
        <Icon name={row.isExpanded ? "chevronDown" : "chevronRight"} />
      </Box>
      {colMeta.type === "category" ? (
        <Tag tagColor={colMeta.colorScale(groupedCell.value)}>
          {formatter(groupedCell)}
        </Tag>
      ) : (
        <Box
          component="span"
          sx={{
            color: textColor,
            fontWeight: "bold",
          }}
        >
          {formatter(groupedCell)}
        </Box>
      )}
    </ButtonBase>
  );

  return (
    <Flex
      role={colSpan ? "cell" : undefined}
      aria-colspan={colSpan}
      onClick={toggleRow}
      sx={{ minWidth: "100%", cursor: "pointer", backgroundColor: bg }}
    >
      {toggle}
    </Flex>
  );
};

const getGroupLevelShade = (level: number) => {
  switch (level) {
    case 2:
      return 200;
    case 3:
      return 300;
    case 4:
      return 400;
    case 5:
      return 500;
    case 6:
      return 600;
    default:
      return 100;
  }
};
