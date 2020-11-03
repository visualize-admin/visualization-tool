import { ReactNode } from "react";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { Box } from "theme-ui";
import { ComponentFieldsFragment } from "../../../graphql/query-hooks";
import { DataCubeMetadata } from "../../../graphql/types";
import { Icon } from "../../../icons";
import { useActiveFieldField } from "../../config-form";
import { getFieldLabel } from "../ui-helpers";
import { DraggableTab } from "./control-tab";
import { ControlSection, ControlSectionContent, SectionTitle } from "./section";

type Props = {
  id: string;
  title: ReactNode;
  items: { componentIri: string }[];
  metaData: DataCubeMetadata;
};
export const TabDropZone = ({ id, items, title, metaData }: Props) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];

  return (
    <Droppable droppableId={id}>
      {({ innerRef, placeholder }, { isDraggingOver, isUsingPlaceholder }) => {
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
                {items.map(({ componentIri }, i) => {
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
                              upperLabel={`${getFieldLabel(`table.column`)} ${
                                i + 1
                              }`}
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
  upperLabel: string;
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
