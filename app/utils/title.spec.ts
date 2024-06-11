import keyBy from "lodash/keyBy";

import { ChartConfig } from "@/configurator";
import { Dimension } from "@/domain/data";
import { generateChartTitle } from "@/utils/title";

const dimensionsByIri = keyBy(
  [
    {
      iri: "emissions",
      label: "Emissions of CO2",
      __typename: "OrdinalDimension",
    },
    { iri: "emissions", label: "Year", __typename: "TemporalDimension" },
    { iri: "gastype", label: "Type of Gas", __typename: "NominalDimension" },
  ] as Dimension[],
  (x) => x.iri
);

describe("generateChartTitle", () => {
  it("should generate the correct title for a column chart", () => {
    const columnChartConfig = {
      chartType: "column",
      fields: {
        x: { componentIri: "year" },
        y: { componentIri: "emissions" },
      },
    } as ChartConfig;
    const expectedTitle = "Emissions of CO2 per Year";

    const actualTitle = generateChartTitle(columnChartConfig, dimensionsByIri);

    expect(actualTitle).toBe(expectedTitle);
  });

  it("should generate the correct title for a line chart", () => {
    const lineChartConfig = {
      chartType: "line",
      fields: {
        x: { componentIri: "year" },
        y: { componentIri: "emissions" },
      },
    } as ChartConfig;
    const expectedTitle = "Evolution of the Emissions of CO2";

    const actualTitle = generateChartTitle(lineChartConfig, dimensionsByIri);

    expect(actualTitle).toBe(expectedTitle);
  });

  it("should generate the correct title for an area chart", () => {
    const areaChartConfig = {
      chartType: "pie",
      fields: {
        y: { componentIri: "emissions" },
        segment: { componentIri: "gastype" },
      },
    } as ChartConfig;
    const expectedTitle = "Shares of Emissions of CO2 by Type of Gas";

    const actualTitle = generateChartTitle(areaChartConfig, dimensionsByIri);

    expect(actualTitle).toBe(expectedTitle);
  });
});
