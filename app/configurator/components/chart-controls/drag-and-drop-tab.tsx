import { Trans } from "@lingui/macro";
import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";

import { MoveDragButton } from "@/components/move-drag-button";
import { TableColumn } from "@/config-types";
import { DraggableTab } from "@/configurator/components/chart-controls/control-tab";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import { getIconName } from "@/configurator/components/ui-helpers";
import { useActiveChartField } from "@/configurator/config-form";
import { Component, Dimension, Measure } from "@/domain/data";

const useStyles = makeStyles((theme: Theme) => ({
  filterRow: {
    display: "grid",
    gridTemplateColumns: "auto min-content",
    overflow: "hidden",
    width: "100%",
    gridColumnGap: theme.spacing(2),
    gridTemplateRows: "min-content min-content",
    gridTemplateAreas: '"description drag-button" "select drag-button"',
    "& .buttons": {
      transition: "color 0.125s ease, opacity 0.125s ease-out",
      opacity: 0.25,
      color: theme.palette.secondary.active,
    },
    "& .buttons:hover": {
      opacity: 1,
    },
    "& > *": {
      overflow: "hidden",
    },
  },
  dragButtons: {
    gridArea: "drag-button",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 0,
    flexShrink: 0,
    paddingBottom: 0,
  },
}));

type TabDropZoneProps = {
  id: string;
  title: ReactNode;
  items: TableColumn[];
  dimensions: Dimension[];
  measures: Measure[];
  isDropDisabled?: boolean;
  emptyComponent?: React.ReactNode;
};

export const TabDropZone = (props: TabDropZoneProps) => {
  const {
    id,
    title,
    items,
    dimensions,
    measures,
    isDropDisabled,
    emptyComponent,
  } = props;
  const classes = useStyles();
  const components = [...dimensions, ...measures];

  return (
    <Droppable droppableId={id} isDropDisabled={isDropDisabled}>
      {({ innerRef, placeholder }, { isDraggingOver }) => {
        return (
          <ControlSection isHighlighted={isDraggingOver} collapse>
            <SubsectionTitle gutterBottom={false}>{title}</SubsectionTitle>
            <ControlSectionContent
              px="small"
              role="tablist"
              aria-labelledby={`controls-${id}`}
            >
              <Box
                sx={{ p: 0, minHeight: 60, position: "relative" }}
                ref={innerRef}
              >
                {items.length === 0 && emptyComponent ? emptyComponent : null}
                {items.map(({ componentId, index, isHidden }, i) => {
                  return (
                    <Draggable
                      key={componentId}
                      draggableId={componentId}
                      index={i}
                    >
                      {(
                        { innerRef, draggableProps, dragHandleProps },
                        { isDragging }
                      ) => {
                        return (
                          <Box
                            ref={innerRef}
                            {...draggableProps}
                            {...dragHandleProps}
                            className={classes.filterRow}
                          >
                            <DraggableTabField
                              key={componentId}
                              component={
                                components.find((d) => d.id === componentId)!
                              }
                              value={componentId}
                              upperLabel={
                                <Trans id="table.column.no">
                                  Column {index + 1}
                                </Trans>
                              }
                              isDragging={isDragging}
                              disabled={isHidden}
                            />
                            <Box className={classes.dragButtons}>
                              <MoveDragButton />
                            </Box>
                          </Box>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {placeholder}
              </Box>
            </ControlSectionContent>
          </ControlSection>
        );
      }}
    </Droppable>
  );
};

const DraggableTabField = ({
  component,
  value,
  isDragging,
  upperLabel,
  disabled,
}: {
  component: Component;
  value: string;
  disabled?: boolean;
  isDragging: boolean;
  upperLabel: ReactNode;
}) => {
  const field = useActiveChartField({ value });
  const iconName = getIconName(
    `tableColumn${component.__typename}${disabled ? "Hidden" : ""}`
  );

  return (
    <DraggableTab
      component={component}
      value={`${field.value}`}
      upperLabel={upperLabel}
      checked={field.checked}
      onClick={field.onClick}
      isDragging={isDragging}
      disabled={disabled}
      iconName={iconName}
    />
  );
};
