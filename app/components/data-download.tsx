import { t, Trans } from "@lingui/macro";
import {
  Button,
  CircularProgress,
  ListSubheader,
  MenuItem,
  Typography,
  useEventCallback,
} from "@mui/material";
import { ascending } from "d3-array";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import keyBy from "lodash/keyBy";
import {
  createContext,
  Dispatch,
  memo,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useClient } from "urql";

import { getSortedComponents } from "@/browse/datatable";
import { ArrowMenuBottomTop } from "@/components/arrow-menu";
import { DataSource, SortingField } from "@/config-types";
import {
  Component,
  DataCubeComponents,
  DataCubesObservations,
  Observation,
} from "@/domain/data";
import {
  dateFormatterFromDimension,
  formatIdentity,
  getFormatFullDateAuto,
  getFormattersForLocale,
} from "@/formatters";
import {
  executeDataCubesComponentsQuery,
  executeDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { DataCubeObservationFilter } from "@/graphql/query-hooks";
import { Icon } from "@/icons";
import { Locale } from "@/locales/locales";
import { useLocale } from "@/src";
import { makeDimensionValueSorters } from "@/utils/sorting-values";
import { useI18n } from "@/utils/use-i18n";

type DataDownloadState = {
  isDownloading: boolean;
  error?: string;
};

const DataDownloadStateContext = createContext<
  [DataDownloadState, Dispatch<DataDownloadState>] | undefined
>(undefined);

const useDataDownloadState = () => {
  const ctx = useContext(DataDownloadStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <DataDownloadStateProvider /> to useDataDownloadState()"
    );
  }

  return ctx;
};

const DataDownloadStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useState<DataDownloadState>({
    isDownloading: false,
  });

  return (
    <DataDownloadStateContext.Provider value={[state, dispatch]}>
      {children}
    </DataDownloadStateContext.Provider>
  );
};

const FILE_FORMATS = ["csv", "xlsx"] as const;
type FileFormat = (typeof FILE_FORMATS)[number];

const makeColumnLabel = (dim: Component) => {
  return `${dim.label}${dim.unit ? ` (${dim.unit})` : ""}`;
};

const prepareData = ({
  components,
  observations,
  dimensionParsers,
}: {
  components: Component[];
  observations: Observation[];
  dimensionParsers: DimensionParsers;
}) => {
  const sortedComponents = getSortedComponents(components);
  const columns = keyBy(sortedComponents, (d) => d.id);
  // Sort the data from left to right, keeping the order of the columns.
  const sorting: SortingField["sorting"] = {
    sortingType: "byAuto",
    sortingOrder: "asc",
  };

  const sorters = sortedComponents.map<
    [string, ReturnType<typeof makeDimensionValueSorters>]
  >((d) => {
    return [d.id, makeDimensionValueSorters(d, { sorting })];
  });
  // We need to sort before parsing, to access raw observation values, where
  // dates are formatted in the format of YYYY-MM-DD, etc.
  const sortedData = [...observations];
  sortedData.sort((a, b) => {
    for (const [iri, dimSorters] of sorters) {
      for (const sorter of dimSorters) {
        const sortResult = ascending(
          sorter(a[iri] as string),
          sorter(b[iri] as string)
        );

        if (sortResult !== 0) {
          return sortResult;
        }
      }
    }
    return 0;
  });

  const parsedData = sortedData.map((obs) => {
    const formattedObs = Object.keys(obs).reduce<Observation>((acc, key) => {
      return {
        ...acc,
        [key]: formatIdentity(obs[key]),
      };
    }, {});

    return Object.keys(formattedObs).reduce<Observation>((acc, key) => {
      const col = columns[key];
      const parser = dimensionParsers[key];

      if (!col) return acc;

      const value = formattedObs[key];
      let parsedValue;

      if (value?.toString() === "–") {
        parsedValue = "-";
      } else {
        parsedValue = parser(value as string);
      }

      return {
        ...acc,
        [makeColumnLabel(col)]: parsedValue,
      };
    }, {});
  });

  const columnKeys = Object.values(columns).map(makeColumnLabel);

  return {
    data: parsedData,
    columnKeys,
  };
};

const RawMenuItem = ({ children }: PropsWithChildren<{}>) => {
  return (
    <MenuItem
      sx={{
        whiteSpace: "normal",

        "&:hover": {
          backgroundColor: "transparent",
          cursor: "default",
        },
      }}
    >
      {children}
    </MenuItem>
  );
};

export const DataDownloadMenu = memo(
  ({
    dataSource,
    filters,
    title,
  }: {
    dataSource: DataSource;
    filters: DataCubeObservationFilter;
    title: string;
  }) => {
    return (
      <DataDownloadStateProvider>
        <DataDownloadInnerMenu
          dataSource={dataSource}
          fileName={title}
          filters={filters}
        />
      </DataDownloadStateProvider>
    );
  }
);

const DataDownloadInnerMenu = ({
  dataSource,
  fileName,
  filters,
}: {
  dataSource: DataSource;
  fileName: string;
  filters: DataCubeObservationFilter;
}) => {
  const [state] = useDataDownloadState();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const handleClose = useEventCallback(() => setAnchor(null));

  return (
    <>
      <Button
        variant="text"
        color="blue"
        size="sm"
        startIcon={
          state.isDownloading ? (
            <CircularProgress size={20} />
          ) : (
            <Icon name="download" size={20} />
          )
        }
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          width: "fit-content",
          minHeight: 0,
          p: 0,
          ml: "2.5px",
          fontSize: "inherit",
        }}
      >
        <Trans id="button.download.data">Download data</Trans>
      </Button>
      <ArrowMenuBottomTop
        open={!!anchor}
        anchorEl={anchor}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        transformOrigin={{ horizontal: "center", vertical: "bottom" }}
        MenuListProps={{
          sx: {
            width: 200,
          },
        }}
        sx={{
          transform: "translateY(-12px)",
        }}
      >
        {filters.filters && (
          <DataDownloadMenuSection
            dataSource={dataSource}
            subheader={
              <Trans id="button.download.data.visible">Chart dataset</Trans>
            }
            fileName={`${fileName}-filtered`}
            filters={filters}
          />
        )}
        <DataDownloadMenuSection
          dataSource={dataSource}
          subheader={<Trans id="button.download.data.all">Full dataset</Trans>}
          fileName={`${fileName}-full`}
          filters={getFullDataDownloadFilters(filters)}
        />
        {state.error && (
          <RawMenuItem>
            <Typography variant="caption" color="error.main">
              {state.error}
            </Typography>
          </RawMenuItem>
        )}
      </ArrowMenuBottomTop>
    </>
  );
};

/** We need to include every cube column in full dataset download (client's
 * request), so we do not pass any component ids here
 * */
export const getFullDataDownloadFilters = (
  filters: DataCubeObservationFilter
) => {
  return { iri: filters.iri };
};

const DataDownloadMenuSection = ({
  dataSource,
  subheader,
  fileName,
  filters,
}: {
  dataSource: DataSource;
  subheader: ReactNode;
  fileName: string;
  filters?: DataCubeObservationFilter;
}) => {
  return (
    <>
      <ListSubheader>{subheader}</ListSubheader>
      {FILE_FORMATS.map((fileFormat) => (
        <DownloadMenuItem
          key={fileFormat}
          dataSource={dataSource}
          fileName={fileName}
          fileFormat={fileFormat}
          filters={filters}
        />
      ))}
    </>
  );
};

const DownloadMenuItem = ({
  dataSource,
  fileName,
  fileFormat,
  filters,
}: {
  dataSource: DataSource;
  fileName: string;
  fileFormat: FileFormat;
  filters?: DataCubeObservationFilter;
}) => {
  const locale = useLocale();
  const i18n = useI18n();
  const client = useClient();
  const [state, dispatch] = useDataDownloadState();
  const download = useCallback(
    async (
      componentsData: { dataCubesComponents: DataCubeComponents } | undefined,
      observationsData:
        | { dataCubesObservations: DataCubesObservations }
        | undefined
    ) => {
      if (
        !(
          componentsData?.dataCubesComponents &&
          observationsData?.dataCubesObservations
        )
      ) {
        return;
      }

      const { dimensions, measures } = componentsData.dataCubesComponents;
      const components = [...dimensions, ...measures];
      const dimensionParsers = getDimensionParsers(components, { locale });
      const observations = observationsData.dataCubesObservations.data;

      const { columnKeys, data } = prepareData({
        components,
        observations,
        dimensionParsers,
      });

      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("data");
      worksheet.columns = columnKeys.map((d) => ({
        header: d,
        key: d,
      }));
      worksheet.addRows(data);

      switch (fileFormat) {
        case "csv":
          const csv = await workbook.csv.writeBuffer();
          saveAs(
            new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
            `${fileName}.csv`
          );
          break;
        case "xlsx":
          const xlsx = await workbook.xlsx.writeBuffer();
          saveAs(
            new Blob([xlsx], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
            }),
            `${fileName}.xlsx`
          );
          break;
      }
    },
    [fileFormat, fileName, locale]
  );

  return (
    <MenuItem
      disabled={state.isDownloading}
      onClick={async () => {
        if (!filters) {
          return;
        }

        dispatch({ isDownloading: true });

        try {
          const [componentsResult, observationsResult] = await Promise.all([
            executeDataCubesComponentsQuery(client, {
              sourceType: dataSource.type,
              sourceUrl: dataSource.url,
              locale,
              cubeFilters: [filters],
            }),
            executeDataCubesObservationsQuery(client, {
              sourceType: dataSource.type,
              sourceUrl: dataSource.url,
              locale,
              cubeFilters: [filters],
            }),
          ]);

          if (componentsResult.data && observationsResult.data) {
            await download(componentsResult.data, observationsResult.data);
          } else if (componentsResult.error || observationsResult.error) {
            dispatch({
              ...state,
              error: i18n._(
                t({
                  id: "hint.dataloadingerror.message",
                  message: "The data could not be loaded.",
                })
              ),
            });
          }
        } catch (e) {
          console.error(
            i18n._(
              t({
                id: "hint.dataloadingerror.message",
                message: "The data could not be loaded.",
              })
            ),
            e
          );
        } finally {
          dispatch({ ...state, isDownloading: false });
        }
      }}
    >
      {fileFormat.toUpperCase()}
    </MenuItem>
  );
};

type DimensionParsers = {
  [iri: string]: (d: string) => any;
};

const getDimensionParsers = (
  components: Component[],
  { locale }: { locale: Locale }
): DimensionParsers => {
  return Object.fromEntries(
    components.map((d) => {
      switch (d.__typename) {
        case "GeoCoordinatesDimension":
        case "GeoShapesDimension":
        case "NominalDimension":
        case "OrdinalDimension":
        case "TemporalEntityDimension":
        case "TemporalOrdinalDimension":
          return [d.id, (d) => d];
        case "NumericalMeasure":
        case "StandardErrorDimension":
        case "ConfidenceUpperBoundDimension":
        case "ConfidenceLowerBoundDimension":
          return [d.id, (d) => +d];
        case "OrdinalMeasure":
          return d.isNumerical ? [d.id, (d) => +d] : [d.id, (d) => d];
        case "TemporalDimension": {
          if (d.timeUnit === "Year") {
            return [d.id, (d) => +d];
          }

          // We do not want to parse dates as dates, but strings (for easier
          // handling in Excel).
          const dateFormatters = getFormattersForLocale(locale);
          const formatDateAuto = getFormatFullDateAuto(dateFormatters);

          return [
            d.id,
            dateFormatterFromDimension(d, dateFormatters, formatDateAuto),
          ];
        }
        default:
          const _exhaustiveCheck: never = d;
          return _exhaustiveCheck;
      }
    })
  );
};
