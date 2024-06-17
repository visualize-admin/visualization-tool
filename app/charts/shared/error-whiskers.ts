export type RenderWhiskerDatum = {
  key: string;
  x: number;
  y1: number;
  y2: number;
  width: number;
  fill?: string;
};

export const renderWhiskers = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderWhiskerDatum[],
  options: RenderOptions
) => {
  const { transition } = options;

  g.selectAll<SVGGElement, RenderWhiskerDatum>("g")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("opacity", 0)
          .call((g) =>
            g
              .append("rect")
              .attr("class", "top")
              .attr("x", (d) => d.x)
              .attr("y", (d) => d.y2)
              .attr("width", (d) => d.width)
              .attr("height", 2)
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .append("rect")
              .attr("class", "middle")
              .attr("x", (d) => d.x + d.width / 2 - 1)
              .attr("y", (d) => d.y2)
              .attr("width", 2)
              .attr("height", (d) => Math.max(0, d.y1 - d.y2))
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .append("rect")
              .attr("class", "bottom")
              .attr("x", (d) => d.x)
              .attr("y", (d) => d.y1)
              .attr("width", (d) => d.width)
              .attr("height", 2)
              .attr("fill", (d) => d.fill ?? "black")
              .attr("stroke", "none")
          )
          .call((enter) =>
            maybeTransition(enter, {
              s: (g) => g.attr("opacity", 1),
              transition,
            })
          ),
      (update) =>
        maybeTransition(update, {
          s: (g) =>
            g
              .attr("opacity", 1)
              .call((g) =>
                g
                  .select(".top")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y2)
                  .attr("width", (d) => d.width)
              )
              .call((g) =>
                g
                  .select(".middle")
                  .attr("x", (d) => d.x + d.width / 2 - 1)
                  .attr("y", (d) => d.y2)
                  .attr("height", (d) => Math.max(0, d.y1 - d.y2))
              )
              .call((g) =>
                g
                  .select(".bottom")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y1)
                  .attr("width", (d) => d.width)
              ),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.attr("opacity", 0).remove(),
        })
    );
};

export const filterWithoutErrors =
  (getError: ((d: Observation) => ObservationValue) | null) =>
  (d: Observation): boolean =>
    !!getError?.(d);
