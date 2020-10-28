import { Draggable, Droppable } from "react-beautiful-dnd";

type Props = {
  id: string;
  items: { id: string }[];
};
export const TabDropZone = ({ id, items }: Props) => {
  return (
    <Droppable droppableId={id}>
      {({ innerRef, placeholder }, { isDraggingOver }) => {
        return (
          <div
            ref={innerRef}
            style={{
              background: isDraggingOver ? "hotpink" : "teal",
              padding: 10,
            }}
          >
            {items.map((item, i) => {
              return (
                <Draggable key={item.id} draggableId={item.id} index={i}>
                  {(
                    { innerRef, draggableProps, dragHandleProps },
                    { isDragging }
                  ) => {
                    return (
                      <div
                        ref={innerRef}
                        {...draggableProps}
                        // {...dragHandleProps}
                        style={{
                          background: isDragging ? "darkblue" : "#ccc",
                          ...draggableProps.style,
                        }}
                      >
                        Item {item.id}
                        <div
                          style={{
                            background: "black",
                            width: 20,
                            height: 20,
                            display: "inline-block",
                          }}
                          {...dragHandleProps}
                        ></div>
                      </div>
                    );
                  }}
                </Draggable>
              );
            })}
            {placeholder}
          </div>
        );
      }}
    </Droppable>
  );
};
