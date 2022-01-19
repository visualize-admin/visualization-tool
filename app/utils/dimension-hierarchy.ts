import { ascending } from "d3";
import { useEffect, useState } from "react";
import { Client, useClient } from "urql";
import { DataCubeObservationsDocument } from "../graphql/query-hooks";

export type DimensionHierarchy = {
  dimensionIri: string;
  children: DimensionHierarchy[];
};

export const getHierarchyDimensionPath = (
  dimensionIri: string,
  hierarchy: DimensionHierarchy[]
): string[] => {
  const helper = (
    dimensionIri: string,
    hierarchy: DimensionHierarchy[],
    curPath: string[]
  ): string[] | undefined => {
    for (let dimensionHierarchy of hierarchy) {
      if (dimensionHierarchy.dimensionIri === dimensionIri) {
        return [...curPath, dimensionIri];
      } else {
        const childPath = helper(dimensionIri, dimensionHierarchy.children, [
          ...curPath,
          dimensionHierarchy.dimensionIri,
        ]);
        if (childPath) {
          return [...curPath, ...childPath];
        }
      }
    }
  };
  return helper(dimensionIri, hierarchy, []) || [dimensionIri];
};

export type HierarchyValue = {
  depth: number;
  children: HierarchyValue[];
  dimensionIri: string;
  value: string; // iri
  label: string;
};

export const inferLabelsTree = (
  dimensionIri: string,
  hierarchy: DimensionHierarchy[],
  observationsData: any[]
) => {
  const path = getHierarchyDimensionPath(dimensionIri, hierarchy);

  // dimensionIri -> parentIri > childIris[]
  const roots = new Set<string>();
  const childrenByLabels = {} as Record<string, Record<string, Set<string>>>;
  for (let i = 0; i < path.length; i++) {
    const parentIri = path[i];
    const childIri = path[i + 1];
    childrenByLabels[parentIri] = childrenByLabels[parentIri] || {};
    for (let obs of observationsData) {
      const parentValue = obs[parentIri];
      if (i === 0) {
        roots.add(parentValue);
      }
      if (childIri) {
        const childValue = obs[childIri];
        if (!childrenByLabels[parentIri][parentValue]) {
          childrenByLabels[parentIri][parentValue] = new Set();
        }
        childrenByLabels[parentIri][parentValue].add(childValue);
      }
    }
  }

  const makeItem = (depth: number, label: string): HierarchyValue => {
    const dimensionIri = path[depth];
    const childLabels = childrenByLabels?.[dimensionIri]?.[label] || [];
    return {
      depth,
      dimensionIri,
      children: Array.from(childLabels).map((l) => makeItem(depth + 1, l)),
      label,

      // Value is replaced later
      value: "UNKNOWN",
    };
  };
  const tree = Array.from(roots).map((l) => makeItem(0, l));
  return tree;
};

/**
 *
 * @param tree G
 * @param valuesByLabels
 */
const addValuesToTree = (
  tree: HierarchyValue[],
  valuesByLabels: Record<string, Record<string, string>>
) => {
  for (let child of tree) {
    if (child.label) {
      child.value = valuesByLabels?.[child.dimensionIri]?.[child.label];
    }
    if (child.children && child.children.length > 0) {
      addValuesToTree(child.children, valuesByLabels);
    }
  }
};

type TreeSorters = Record<
  string,
  ({ value, label }: { value?: string; label?: string }) => string | undefined
>;

const defaultSorter = ({ value, label }: { value?: string; label?: string }) =>
  label || value;

export const sortTree = (tree: HierarchyValue[], sorters?: TreeSorters) => {
  const dimensionIri = tree[0].dimensionIri;
  const sorter = sorters?.[dimensionIri] || defaultSorter;
  if (dimensionIri && sorter) {
    tree.sort((a, b) => ascending(sorter(a), sorter(b)));
    for (let child of tree) {
      if (child.children && child.children.length > 0) {
        sortTree(child.children, sorters);
      }
    }
  }
};

type ObservationsDimension = {
  iri: string;
  values: { value: string; label: string }[];
};

export const fetchDimensionValuesTree = async ({
  dataSetIri,
  dimensionIri,
  hierarchy,
  client,
  locale,
  sorters,
}: {
  dataSetIri: string;
  dimensionIri: string;
  hierarchy: DimensionHierarchy[];
  client: Client;
  locale: string;
  sorters?: TreeSorters;
}) => {
  const path = getHierarchyDimensionPath(dimensionIri, hierarchy);

  const observationsResponse = await client
    .query(DataCubeObservationsDocument, {
      iri: dataSetIri,
      locale,
      measures: path,
    })
    .toPromise();
  const {
    data: {
      dataCubeByIri: {
        observations: { data: observationsData },
        dimensions,
      },
    },
  } = observationsResponse;

  const tree = inferLabelsTree(dimensionIri, hierarchy, observationsData);
  const valuesByLabels = Object.fromEntries(
    dimensions.map(({ iri, values }: ObservationsDimension) => {
      return [
        iri,
        values.reduce((acc, dimensionValue) => {
          acc[dimensionValue.label] = dimensionValue.value;
          return acc;
        }, {} as Record<string, string>),
      ];
    })
  );

  addValuesToTree(tree, valuesByLabels);

  sortTree(tree, sorters);

  return tree;
};

const isHierarchyEnabled = () => {
  try {
    return window.location.search.includes("bathingsitehierarchy");
  } catch {
    return false;
  }
};

const hierarchy = (
  isHierarchyEnabled()
    ? [
        {
          dimensionIri:
            "https://environment.ld.admin.ch/foen/ubd0104/monitoringprogramm",
          children: [
            {
              dimensionIri:
                "https://environment.ld.admin.ch/foen/ubd0104/station",
              children: [],
            },
          ],
        },
      ]
    : []
) as DimensionHierarchy[];

export const useHierarchicalDimensionValuesQuery = ({
  dimensionIri,
  locale,
  dataSetIri,
}: {
  dimensionIri: string;
  locale: string;
  dataSetIri: string;
}) => {
  const client = useClient();

  const [result, setResult] = useState<{
    data?: HierarchyValue[];
    fetching: boolean;
    error?: unknown;
  }>({
    data: undefined,
    fetching: true,
    error: undefined,
  });

  useEffect(() => {
    const run = async () => {
      try {
        const tree = await fetchDimensionValuesTree({
          dataSetIri,
          dimensionIri,
          hierarchy,
          client,
          locale,
        });
        setResult({ data: tree, fetching: false, error: undefined });
      } catch (error) {
        setResult({ data: undefined, fetching: false, error });
      }
    };
    run();
  }, [dataSetIri, dimensionIri, locale, client]);

  return result;
};
