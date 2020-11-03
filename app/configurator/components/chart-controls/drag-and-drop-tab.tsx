import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Box } from "theme-ui";
import { ComponentFieldsFragment } from "../../../graphql/query-hooks";
import { DataCubeMetadata } from "../../../graphql/types";
import { Icon } from "../../../icons";
import { useActiveFieldField } from "../../config-form";
import { TableColumn } from "../../config-types";
import { DraggableTab } from "./control-tab";
import { ControlSection, ControlSectionContent, SectionTitle } from "./section";

type Props = {
  id: string;
  title: ReactNode;
  items: TableColumn[];
  metaData: DataCubeMetadata;
  isDropDisabled?: boolean;
};
export const TabDropZone = ({
  id,
  items,
  title,
  metaData,
  isDropDisabled,
}: Props) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];

  return (
    <Droppable droppableId={id} isDropDisabled={isDropDisabled}>
      {(
        { innerRef, placeholder },
        { isDraggingOver, isUsingPlaceholder, draggingOverWith }
      ) => {
        return (
          <ControlSection isHighlighted={isDraggingOver}>
            <SectionTitle>{title}</SectionTitle>
            <ControlSectionContent
              side="left"
              role="tablist"
              aria-labelledby={`controls-${id}`}
            >
              <Box
                sx={{ p: 0, minHeight: 60, position: "relative" }}
                ref={innerRef}
              >
                {/* <Box
                  sx={{
                    height: 48,
                    borderColor: "monochrome300",
                    borderWidth: 2,
                    borderStyle: "dashed",
                    position: "absolute",
                    right: 0,
                    left: 0,
                    top: 0,
                    bottom: 0,
                    m: 2,
                  }}
                >
                  &nbsp;
                </Box> */}
                {items.map(({ componentIri, index }, i) => {
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
                            // {...dragHandleProps}
                            style={{
                              ...draggableProps.style,
                            }}
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
                            />
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                position: "absolute",
                                top: "50%",
                                right: 3,
                                marginTop: -12,
                                color: isDragging
                                  ? "secondaryActive"
                                  : "secondaryDisabled",
                                ":hover": {
                                  color: "secondaryHover",
                                },
                              }}
                              {...dragHandleProps}
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
}: {
  component: ComponentFieldsFragment;
  value: string;
  disabled?: boolean;
  isDragging: boolean;
  upperLabel: ReactNode;
}) => {
  const field = useActiveFieldField({
    value,
  });

  return (
    <DraggableTab
      component={component}
      value={`${field.value}`}
      upperLabel={upperLabel}
      checked={field.checked}
      onClick={field.onClick}
      isDragging={isDragging}
    ></DraggableTab>
  );
};
