import {
  Attribute,
  DataCube,
  DataCubeEntryPoint,
  Dimension,
  Measure
} from "@zazuko/query-rdf-data-cube";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo
} from "react";
import { useRemoteData } from "../lib/remote-data";
import { useLocale } from "../lib/use-locale";

const DataCubeContext = createContext<string>("");

export const DataCubeProvider = ({
  endpoint,
  children
}: {
  endpoint: string;
  children?: ReactNode;
}) => (
  <DataCubeContext.Provider value={endpoint}>
    {children}
  </DataCubeContext.Provider>
);

const useDataCubeEntryPoint = () => {
  const endpoint = useContext(DataCubeContext);
  const locale = useLocale();
  return useMemo(() => {
    return new DataCubeEntryPoint(endpoint, { languages: [locale] });
  }, [endpoint, locale]);
};

export const useDataSets = () => {
  const entryPoint = useDataCubeEntryPoint();
  const fetchCb = useCallback(() => entryPoint.dataCubes(), [entryPoint]);
  return useRemoteData(fetchCb);
};

interface Metadata {
  dimensions: Dimension[];
  attributes: Attribute[];
  measures: Measure[];
}
export const useDataSetMetadata = (dataSet: DataCube) => {
  const fetchMeta = useCallback(async () => {
    return {
      dimensions: await dataSet.dimensions(),
      attributes: await dataSet.attributes(),
      measures: await dataSet.measures()
    };
  }, [dataSet]);

  return useRemoteData(fetchMeta);
};

export const useObservations = ({
  dataset,
  namedSelection
}: {
  dataset: DataCube;
  namedSelection: any;
}) => {
  const fetchData = useCallback(async () => {
    const query = dataset
      .query()
      .select(namedSelection)
      .limit(100000);
    const data = await query.execute();
    return {
      results: data // await query.execute()
    };
  }, [dataset, namedSelection]);

  return useRemoteData(fetchData);
};

/**
 * @fixme use metadata to filter time dimension!
 */
export const getTimeDimensions = ({
  dimensions
}: {
  dimensions: Dimension[];
}) => dimensions.filter(dim => dim.labels[0].value === "Jahr");
/**
 * @fixme use metadata to filter time dimension!
 */
export const getCategoricalDimensions = ({
  dimensions
}: {
  dimensions: Dimension[];
}) => dimensions.filter(dim => dim.labels[0].value !== "Jahr");

// const observation = {
//   Holzartengruppe: {
//     value: { value: "http://example.org/pflanzungen/property/1/0" },
//     label: {
//       value: "Holzartengruppe - Total",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     }
//   },
//   Jahr: {
//     value: {
//       value: "1975",
//       datatype: { value: "http://www.w3.org/2001/XMLSchema#gYear" },
//       language: ""
//     },
//     label: {
//       value: "",
//       datatype: { value: "http://www.w3.org/2001/XMLSchema#string" },
//       language: ""
//     }
//   },
//   Variable: {
//     value: { value: "http://example.org/pflanzungen/property/0/0" },
//     label: {
//       value: "Anzahl Pflanzungen",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     }
//   },
//   Eigentümertyp: {
//     value: { value: "http://example.org/pflanzungen/property/2/0" },
//     label: {
//       value: "Eigentümertyp - Total",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     }
//   },
//   Forstzone: {
//     label: {
//       value: "Schweiz",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     },
//     value: { value: "http://example.org/pflanzungen/property/4/0" }
//   },
//   Kanton: {
//     label: {
//       value: "Schweiz",
//       datatype: {
//         value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
//       },
//       language: "de"
//     },
//     value: { value: "http://example.org/pflanzungen/property/3/0" }
//   },
//   measure: {
//     value: {
//       value: "14987.125",
//       datatype: { value: "http://www.w3.org/2001/XMLSchema#decimal" },
//       language: ""
//     }
//   }
// };
