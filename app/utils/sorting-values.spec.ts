import orderBy from "lodash/orderBy";
import { describe, expect, it } from "vitest";

import { SortingField } from "@/configurator";
import { Dimension, Measure } from "@/domain/data";
import {
  getSortingOrders,
  makeDimensionValueSorters,
  maybeInt,
} from "@/utils/sorting-values";

const dimension = {
  values: [
    {
      value: "A",
      label: "A",
      position: 5,
      identifier: "A",
    },
    {
      value: "B",
      label: "B",
      position: 5,
      identifier: "B",
    },
    {
      value: "C",
      label: "C",
      position: 1,
      identifier: "C",
    },
    {
      value: "D",
      label: "D",
      position: 1,
      identifier: "C",
    },
  ],
} as unknown as Dimension;

const measureBySegment = {
  A: 10,
  B: 20,
  C: 15,
  D: 5,
};

const measure = {
  __typename: "NumericalMeasure",
} as unknown as Measure;

const ordinalNumericalDimension = {
  __typename: "OrdinalDimension",
  isNumerical: true,
} as unknown as Measure;

const hierarchicalDimension = {
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
} as unknown as Dimension;

const temporalDimensionYear = {
  __typename: "TemporalDimension",
  values: [
    { value: "2020", label: "2020" },
    { value: "1996", label: "1996" },
    { value: "2019", label: "2019" },
  ],
} as unknown as Dimension;

const temporalDimensionFullDate = {
  __typename: "TemporalDimension",
  values: [
    { value: "2020-01-01", label: "2020-01-01" },
    { value: "1996-05-05", label: "1996-05-05" },
    { value: "2019-12-12", label: "2019-12-12" },
  ],
} as unknown as Dimension;

describe("maybeInt", () => {
  it("should return 0 if the input is 0", () => {
    expect(maybeInt(0)).toEqual(0);
  });

  it("should return Infinity if the input is undefined", () => {
    expect(maybeInt(undefined)).toEqual(Infinity);
  });

  it("should return number if the input is number-parseable string", () => {
    expect(maybeInt("1")).toEqual(1);
  });
});

describe("makeDimensionValueSorters", () => {
  const sortingByAuto: NonNullable<SortingField["sorting"]> = {
    sortingType: "byAuto",
    sortingOrder: "asc",
  };
  const sortingByMeasure: NonNullable<SortingField["sorting"]> = {
    sortingType: "byMeasure",
    sortingOrder: "asc",
  };

  it("should correctly sort dimensions byAuto", () => {
    const values = dimension.values.map((d) => d.value);
    const sorters = makeDimensionValueSorters(dimension, {
      sorting: sortingByAuto,
    });
    const sortingOrders = getSortingOrders(sorters, sortingByAuto);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([
      "C",
      "D",
      "A",
      "B",
    ]);
  });

  it("should correctly sort dimensions byMeasure", () => {
    const values = dimension.values.map((d) => d.value);
    const sorters = makeDimensionValueSorters(dimension, {
      sorting: sortingByMeasure,
      measureBySegment,
    });
    const sortingOrders = getSortingOrders(sorters, sortingByAuto);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([
      "D",
      "A",
      "C",
      "B",
    ]);
  });

  it("should correctly sort numerical measures byAuto", () => {
    const values = [1, 10, 5, 100, 2];
    const sorters = makeDimensionValueSorters(measure, {
      sorting: sortingByAuto,
    });
    const sortingOrders = getSortingOrders(sorters, sortingByAuto);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([1, 2, 5, 10, 100]);
  });

  it("should correctly sort ordinal numerical dimensions byAuto", () => {
    const values = ["1", "10", "5", "100", "2"];
    const sorters = makeDimensionValueSorters(ordinalNumericalDimension, {
      sorting: sortingByAuto,
    });
    const sortingOrders = getSortingOrders(sorters, sortingByAuto);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([
      "1",
      "2",
      "5",
      "10",
      "100",
    ]);
  });

  it("should correctly sort hierarchical dimensions byAuto", () => {
    const values = hierarchicalDimension.values.map((d) => d.value);
    const sorters = makeDimensionValueSorters(hierarchicalDimension, {
      sorting: sortingByAuto,
    });
    const sortingOrders = getSortingOrders(sorters, sortingByAuto);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([
      "CH",
      "CH-PROD-EAST",
      "CH-PROD-WEST",
      "CH-BE",
    ]);
  });

  it("should correctly sort temporal dimensions (year) byAuto", () => {
    const values = temporalDimensionYear.values.map((d) => d.value);
    const sorters = makeDimensionValueSorters(temporalDimensionYear, {
      sorting: sortingByAuto,
    });
    const sortingOrders = getSortingOrders(sorters, sortingByAuto);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([
      "1996",
      "2019",
      "2020",
    ]);
  });

  it("should correctly sort temporal dimensions (full date) byAuto", () => {
    const values = temporalDimensionFullDate.values.map((d) => d.value);
    const sorters = makeDimensionValueSorters(temporalDimensionFullDate, {
      sorting: sortingByAuto,
    });
    const sortingOrders = getSortingOrders(sorters, sortingByAuto);
    expect(orderBy(values, sorters, sortingOrders)).toEqual([
      "1996-05-05",
      "2019-12-12",
      "2020-01-01",
    ]);
  });

  it("should correctly sort byTotalSize (reversed order)", () => {
    const totalSizeDimension = {
      values: [
        { value: "A", label: "A" },
        { value: "B", label: "B" },
        { value: "C", label: "C" },
        { value: "D", label: "D" },
      ],
    } as unknown as Dimension;
    const values = totalSizeDimension.values.map((d) => d.value);
    const sorting: NonNullable<SortingField["sorting"]> = {
      sortingType: "byTotalSize",
      sortingOrder: "asc",
    };
    const sorters = makeDimensionValueSorters(totalSizeDimension, {
      sorting,
      sumsBySegment: { A: 1, B: 2, C: 3, D: 4 },
    });
    const sortingOrders = getSortingOrders(sorters, sorting);
    // Should be reversed
    expect(orderBy(values, sorters, sortingOrders)).toEqual([
      "D",
      "C",
      "B",
      "A",
    ]);
  });
});
