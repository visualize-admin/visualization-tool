import orderBy from "lodash/orderBy";

import { SortingField } from "@/configurator";
import { DimensionMetadataWithHierarchiesFragment } from "@/graphql/query-hooks";
import { makeDimensionValueSorters } from "@/utils/sorting-values";

const dimension = {
  hierarchy: [
    {
      label: "Switzerland",
      value: "CH",
      identifier: "CH",
      depth: 0,
      children: [
        {
          label: "Production Regions",
          value: "CH-PROD",
          identifier: "CH-PROD",
          depth: 1,
          children: [
            {
              label: "West Production Region",
              value: "CH-PROD-WEST",
              identifier: "CH-PROD-WEST",
              depth: 2,
            },
            {
              label: "East Production Region",
              value: "CH-PROD-EAST",
              identifier: "CH-PROD-EAST",
              depth: 2,
            },
          ],
        },
      ],
    },
    {
      label: "Bern",
      value: "CH-BE",
      depth: -1,
      children: [],
    },
  ],
  values: [
    {
      label: "Switzerland",
      value: "CH",
      identifier: "CH",
    },
    {
      label: "Bern",
      value: "CH-BE",
      identifier: "CH-BE",
    },
    {
      label: "West Production Region",
      value: "CH-PROD-WEST",
      identifier: "CH-PROD-WEST",
    },
    {
      label: "East Production Region",
      value: "CH-PROD-EAST",
      identifier: "CH-PROD-EAST",
    },
  ],
} as unknown as DimensionMetadataWithHierarchiesFragment;

describe("makeDimensionValueSorters", () => {
  const sorting: NonNullable<SortingField["sorting"]> = {
    sortingType: "byAuto",
    sortingOrder: "asc",
  };

  it("should correctly sort hierarchical dimensions byAuto", () => {
    const values = dimension.values.map((d) => d.value);
    const sorters = makeDimensionValueSorters(dimension, { sorting });
    expect(orderBy(values, sorters, ["asc"])).toEqual([
      "CH",
      "CH-PROD-EAST",
      "CH-PROD-WEST",
      "CH-BE",
    ]);
  });
});
