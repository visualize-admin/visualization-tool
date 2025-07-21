import {
  Checkbox,
  FormControlLabel,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { ReactNode, useMemo, useState } from "react";
import { Layouts } from "react-grid-layout";

import {
  availableHandlesByBlockType,
  ChartGridLayout,
  generateLayout,
  GridLayout,
} from "@/components/react-grid";
import { useLocalState } from "@/utils/use-local-state";

const generateDOM = ({ count }: { count: number }): ReactNode => {
  return Array.from({ length: count }).map(function (_l, i) {
    return (
      <div key={i}>
        <span className="text">{i}</span>
      </div>
    );
  });
};

export const Example = () => {
  const [count] = useState(5);

  const [allowResize, setAllowResize] = useState(false);

  const resizeHandles = useMemo(
    () => (allowResize ? availableHandlesByBlockType.chart : []),
    [allowResize]
  );
  const [layouts, setLayouts] = useLocalState<Layouts>(
    "react-grid-story-layouts",
    {
      lg: generateLayout({
        resizeHandles,
        count,
        layout: "horizontal",
      }),
    }
  );

  const [gridLayout, setGridLayout] = useState<GridLayout>("horizontal");

  const onChangeGridLayout = (gridLayout: GridLayout) => {
    setGridLayout(gridLayout);
    setLayouts({
      lg: generateLayout({
        resizeHandles,
        count,
        layout: gridLayout,
      }),
    });
  };

  return (
    <>
      <Stack gap="1rem" direction="row">
        <ToggleButtonGroup
          value={gridLayout}
          onChange={(ev) =>
            onChangeGridLayout(
              (ev.target as unknown as { value: GridLayout }).value
            )
          }
        >
          <ToggleButton value="horizontal">Horizontal</ToggleButton>
          <ToggleButton value="vertical">Vertical</ToggleButton>
          <ToggleButton value="wide">Wide</ToggleButton>
          <ToggleButton value="tall">Tall</ToggleButton>
        </ToggleButtonGroup>
        <FormControlLabel
          label={"Allow Resize"}
          control={
            <Checkbox
              checked={allowResize}
              onChange={(_ev, value) => setAllowResize(value)}
            />
          }
        ></FormControlLabel>
      </Stack>
      <ChartGridLayout
        className={"layout"}
        onLayoutChange={(_layouts, allLayouts) => setLayouts(allLayouts)}
        layouts={layouts}
        resize
      >
        {generateDOM({ count })}
      </ChartGridLayout>
    </>
  );
};

const meta = {
  title: "Components/ReactGrid",
  component: ChartGridLayout,
};

export default meta;
