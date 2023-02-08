import { Trans } from "@lingui/macro";
import { Box, Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";

import { DraggableTab } from "@/configurator/components/chart-controls/control-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { getIconName } from "@/configurator/components/ui-helpers";
import { useActiveFieldField } from "@/configurator/config-form";
import { TableColumn } from "@/configurator/config-types";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { Icon } from "@/icons";

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    width: 24,
    height: 24,
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 3,
    margin: "auto",
    "&:hover": {
      color: theme.palette.secondary.dark,
    },
  },
}));

type Props = {
  id: string;
  title: ReactNode;
  items: TableColumn[];
  metaData: DataCubeMetadata;
  isDropDisabled?: boolean;
  emptyComponent?: React.ReactNode;
};
export const TabDropZone = ({
  id,
  items,
  title,
  metaData,
  isDropDisabled,
  emptyComponent,
}: Props) => {
  const { dimensions, measures } = metaData;
  const classes = useStyles();
  const components = [...dimensions, ...measures];

  return (
    <Droppable droppableId={id} isDropDisabled={isDropDisabled}>
      {({ innerRef, placeholder }, { isDraggingOver }) => {
        return (
          <ControlSection isHighlighted={isDraggingOver} collapse>
            <SectionTitle gutterBottom={false}>{title}</SectionTitle>
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
                {items.map(({ componentIri, index, isHidden }, i) => {
                  return (
                    <Draggable
                      key={componentIri}
                      draggableId={componentIri}
                      index={i}
                    >
                      {(
                        { innerRef, draggableProps, dragHandleProps },
                        { isDragging }
                      ) => {
                        return (
                          <Box
                            ref={innerRef}
                            sx={{
                              position: "relative",
                            }}
                            {...draggableProps}
                            style={{
                              ...draggableProps.style,
                            }}
                            {...dragHandleProps}
                          >
                            <DraggableTabField
                              key={componentIri}
                              component={
                                components.find((d) => d.iri === componentIri)!
                              }
                              value={`${componentIri}`}
                              upperLabel={
                                <Trans id="table.column.no">
                                  Column {index + 1}
                                </Trans>
                              }
                              isDragging={isDragging}
                              disabled={isHidden}
                            />
                            <Box
                              className={classes.icon}
                              sx={{
                                color: isDragging
                                  ? "secondary.active"
                                  : "secondary.disabled",
                              }}
                            >
                              <Icon name="dragndrop" />
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
  component: DimensionMetadataFragment;
  value: string;
  disabled?: boolean;
  isDragging: boolean;
  upperLabel: ReactNode;
}) => {
  const field = useActiveFieldField({
    value,
  });

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
