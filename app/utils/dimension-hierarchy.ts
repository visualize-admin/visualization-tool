import { ascending } from "d3";
import { useMemo } from "react";
import {
  DataCubeObservationsQuery,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { defaultSorter, makeOrdinalDimensionSorter } from "./sorting-values";

export type DimensionHierarchy = {
  dimensionIri: string;
  children: DimensionHierarchy[];
};

export type HierarchyValue = {
  depth: number;
  children: HierarchyValue[];
  dimensionIri: string;
  value: string; // iri
  label: string;
};

/**
 * Returns all the parents and the child dimension as an array
 * given a hierarchy
 *
 * In the case of the bathing site hierarchy where monitoring programs
 * are parents of bathing sites, given the dimensinoIri of bathingSite
 * and the hierarchy coming from the dataset, we would get
 * [MONITORING_PROGRAM_IRI, BATHING_SITE_IRI].
 */
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

/**
 * Given a dimension hierarchy (containing for example monitoring program > bathing site),
 * and observations, this method would infer from the observations the label
 * hierarchy.
 *
 * @example
 * Observations:
 *
 * MONITORING PROGRAM | BATHING_SITE      | VALUE
 * -------------------+-------------------+-------
 * Baqua_be           | Aare Lorraine     |   1
 * Baqua_be           | Aare Marzil       |   2
 * Baqua_fr           | Plage Portalban   |   3
 *
 * Hierarchy: [{
 *  dimensionIri: 'Monitoring program',
 *  children: {
 *    dimensionIri: 'Bathing site', children: []
 *  }
 *  }]
 *
 * This method would return a tree similar to
 *
 * Baqua_be
 *    Aare Lorraine
 *    Aare Marzil
 * Baqua_fr
 *    Plage de portalban
 *
 * An important point here is that it works on the labels of the observations.
 * Further work has to be done (in addValuesToTree) to attach values iri to
 * the labels.
 */
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

      // Value is replaced later in addValuesToTree
      value: "UNKNOWN",
    };
  };
  const tree = Array.from(roots).map((l) => makeItem(0, l));
  return tree;
};

/**
 * Will recursively add the values iri to the label tree.
 *
 * @param tree
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
  ({
    value,
    label,
  }: {
    value?: string;
    label?: string;
  }) => string | number | undefined
>;

/** Recursively sorts tree children  */
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

export const makeDimensionValuesTree = ({
  dataCubeData,
  dimensionIri,
  hierarchy,
  sorters,
}: {
  dimensionIri: string;
  dataCubeData: NonNullable<DataCubeObservationsQuery["dataCubeByIri"]>;
  hierarchy: DimensionHierarchy[];
  sorters?: TreeSorters;
}) => {
  const {
    observations: { data: observationsData },
    dimensions,
  } = dataCubeData;

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
    return window.location.search.includes("hierarchies");
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
        {
          dimensionIri:
            "https://environment.ld.admin.ch/foen/red_lists_test_reimport2/phylum",
          children: [
            {
              dimensionIri:
                "https://environment.ld.admin.ch/foen/red_lists_test_reimport2/artengruppe",
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
  const path = useMemo(
    () => getHierarchyDimensionPath(dimensionIri, hierarchy),
    [dimensionIri]
  );

  const [{ data: datacubeResponse, fetching }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSetIri,
      locale,
      measures: path,
    },
  });

  const result = useMemo(() => {
    if (fetching || !datacubeResponse || !datacubeResponse.dataCubeByIri) {
      return { data: undefined, fetching };
    } else {
      const dataCubeData = datacubeResponse.dataCubeByIri;
      const sorters = Object.fromEntries(
        dataCubeData.dimensions.map((dim) => [
          dim.iri,
          dim.__typename === "OrdinalDimension"
            ? makeOrdinalDimensionSorter(dim)
            : defaultSorter,
        ])
      );
      const tree = makeDimensionValuesTree({
        dataCubeData,
        dimensionIri,
        hierarchy,
        sorters,
      });
      return {
        data: tree,
      };
    }
  }, [fetching, datacubeResponse, dimensionIri]);

  return result;
};
