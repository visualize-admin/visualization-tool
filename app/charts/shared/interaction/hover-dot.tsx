import { Box } from "@mui/material";
import { useInteraction } from "@/charts/shared/use-interaction";
import { useChartState } from "@/charts/shared/use-chart-state";
import { LinesState } from "@/charts/line/lines-state";
import { Observation } from "@/domain/data";

export const HoverDot = () => {
  const [state] = useInteraction();

  const { visible, d } = state.interaction;

  return <>{visible && d && <DotInner d={d} />}</>;
};

const DotInner = ({ d }: { d: Observation }) => {
  const { getAnnotationInfo, bounds } = useChartState() as LinesState;

  const { xAnchor, yAnchor, datum } = getAnnotationInfo(d);

  return (
    <>
      {yAnchor && (
        <Box
          style={{
            left: xAnchor + bounds.margins.left,
            top: yAnchor + bounds.margins.top,
            backgroundColor: datum.color,
          }}
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            position: "absolute",
            transform: "translate3d(-50%, -50%, 0)",
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
};
