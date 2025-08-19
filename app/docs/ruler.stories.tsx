import { Meta } from "@storybook/react";

import { RulerContent } from "@/charts/shared/interaction/ruler";
import { TooltipBox } from "@/charts/shared/interaction/tooltip-box";

const meta: Meta = {
  title: "components / Ruler",
  component: TooltipBox,
};

export default meta;

const RulerStory = {
  render: () => {
    return (
      <div style={{ width: 200, height: 450, position: "relative" }}>
        <RulerContent
          rotate={false}
          xValue={"2014"}
          values={[
            {
              label: "Zürich",
              value: "450",
              color: "Orchid",
              axis: "y",
              axisOffset: 450 - 450,
            },
            {
              label: "Lausanne",
              value: "435",
              color: "LightSeaGreen",
              axis: "y",
              axisOffset: 450 - 435,
            },
            {
              label: "Bern",
              value: "235",
              color: "Orange",
              axis: "y",
              axisOffset: 450 - 235,
            },
          ]}
          chartHeight={450}
          margins={{ top: 10, right: 10, bottom: 10, left: 10 }}
          xAnchor={100}
          datum={{
            label: "Zürich",
            value: "450",
            color: "Orchid",
          }}
          placement={{ x: "right", y: "middle" }}
        />
      </div>
    );
  },
};

export { RulerStory as Ruler };
