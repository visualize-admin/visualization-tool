import {
  useColorScale,
  useWidthTimeScale,
  useHeightLinearScale,
  ChartProps
} from "..";

export const useLinesScale = ({
  data,
  fields
}: Pick<ChartProps, "data" | "fields">) => {
  const colors = useColorScale({
    data,
    field: "segment",
    palette: fields.segment?.palette
  });
  const xScale = useWidthTimeScale({ data, field: "x" });
  const yScale = useHeightLinearScale({ data, field: "y" });
  return { colors, xScale, yScale };
};
