import { Trans, t } from "@lingui/macro";
import {
  Button,
  CircularProgress,
  ListSubheader,
  MenuItem,
  Typography,
} from "@mui/material";
import { ascending } from "d3";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import keyBy from "lodash/keyBy";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import {
  bindHover,
  bindMenu,
  usePopupState,
} from "material-ui-popup-state/hooks";
import {
  Dispatch,
  PropsWithChildren,
  ReactNode,
  createContext,
  memo,
  useCallback,
  useContext,
  useState,
} from "react";
import { useClient } from "urql";

import { getSortedColumns } from "@/browse/datatable";
import Flex from "@/components/flex";
import { DataSource, QueryFilters, SortingField } from "@/config-types";
import { Observation } from "@/domain/data";
import {
  dateFormatterFromDimension,
  getFormatFullDateAuto,
  getFormattersForLocale,
} from "@/formatters";
import {
  ComponentsDocument,
  ComponentsQuery,
  ComponentsQueryVariables,
  DataCubeObservationsDocument,
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  DimensionMetadataFragment,
} from "@/graphql/query-hooks";
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

export const useDataDownloadState = () => {
  const ctx = useContext(DataDownloadStateContext);

  if (ctx === undefined) {
    throw Error(
      "You need to wrap your component in <DataDownloadStateProvider /> to useDataDownloadState()"
    );
  }

  return ctx;
};

export const DataDownloadStateProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
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
export type FileFormat = typeof FILE_FORMATS[number];

const makeColumnLabel = (dim: DimensionMetadataFragment) => {
  return `${dim.label}${dim.unit ? ` (${dim.unit})` : ""}`;
};

const prepareData = ({
  components,
  observations,
  dimensionParsers,
}: {
  components: DimensionMetadataFragment[];
  observations: Observation[];
  dimensionParsers: DimensionParsers;
}) => {
  const sortedComponents = getSortedColumns(components);
  const columns = keyBy(sortedComponents, (d) => d.iri);
  // Sort the data from left to right, keeping the order of the columns.
  const sorting: SortingField["sorting"] = {
    sortingType: "byAuto",
    sortingOrder: "asc",
  };
  const sorters = sortedComponents.map<
    [string, ReturnType<typeof makeDimensionValueSorters>]
  >((d) => {
    return [d.iri, makeDimensionValueSorters(d, { sorting })];
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
    return Object.keys(obs).reduce<Observation>((acc, key) => {
      const col = columns[key];
      const parser = dimensionParsers[key];

      return col
        ? {
            ...acc,
            ...{ [makeColumnLabel(col)]: parser(obs[key] as string) },
          }
        : acc;
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
        "&:hover": { backgroundColor: "transparent", cursor: "default" },
        whiteSpace: "normal",
      }}
    >
      {children}
    </MenuItem>
  );
};

export const DataDownloadMenu = memo(
  ({
    dataSetIri,
    dataSource,
    filters,
    title,
  }: {
    dataSetIri: string;
    dataSource: DataSource;
    filters?: QueryFilters;
    title: string;
  }) => {
    return (
      <DataDownloadStateProvider>
        <DataDownloadInnerMenu
          dataSetIri={dataSetIri}
          dataSource={dataSource}
          fileName={title}
          filters={filters}
        />
      </DataDownloadStateProvider>
    );
  }
);

const DataDownloadInnerMenu = ({
  dataSetIri,
  dataSource,
  fileName,
  filters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  fileName: string;
  filters?: QueryFilters;
}) => {
  const [state] = useDataDownloadState();
  const popupState = usePopupState({
    variant: "popover",
    popupId: "dataDownloadMenu",
  });

  return (
    <>
      <Button
        component="a"
        variant="text"
        color="primary"
        size="small"
        startIcon={
          state.isDownloading ? <CircularProgress /> : <Icon name="download" />
        }
        {...bindHover(popupState)}
        sx={{ p: 0, ml: "2px" }}
      >
        <Typography variant="caption">
          <Trans id="button.download.data">Download data</Trans>
        </Typography>
      </Button>
      <HoverMenu
        {...bindMenu(popupState)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        MenuListProps={{
          subheader: (
            <ListSubheader>
              <Trans id="button.download">Download</Trans>
            </ListSubheader>
          ),
          sx: { width: 200, pt: 1, pb: 2 },
        }}
      >
        {filters && (
          <DataDownloadMenuSection
            dataSetIri={dataSetIri}
            dataSource={dataSource}
            subheader={
              <Trans id="button.download.data.visible">Chart dataset</Trans>
            }
            fileName={`${fileName}-filtered`}
            filters={filters}
          />
        )}
        <DataDownloadMenuSection
          dataSetIri={dataSetIri}
          dataSource={dataSource}
          subheader={<Trans id="button.download.data.all">Full dataset</Trans>}
          fileName={`${fileName}-full`}
        />
        {state.error && (
          <RawMenuItem>
            <Typography variant="caption" color="error.main">
              {state.error}
            </Typography>
          </RawMenuItem>
        )}
      </HoverMenu>
    </>
  );
};

const DataDownloadMenuSection = ({
  dataSetIri,
  dataSource,
  subheader,
  fileName,
  filters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  subheader: ReactNode;
  fileName: string;
  filters?: QueryFilters;
}) => {
  return (
    <>
      <ListSubheader sx={{ mt: 3, lineHeight: 1.2, borderBottom: "none" }}>
        {subheader}
      </ListSubheader>
      <RawMenuItem>
        <Flex sx={{ gap: 3 }}>
          {FILE_FORMATS.map((fileFormat) => (
            <DownloadMenuItem
              key={fileFormat}
              dataSetIri={dataSetIri}
              dataSource={dataSource}
              fileName={fileName}
              fileFormat={fileFormat}
              filters={filters}
            />
          ))}
        </Flex>
      </RawMenuItem>
    </>
  );
};

const DownloadMenuItem = ({
  dataSetIri,
  dataSource,
  fileName,
  fileFormat,
  filters,
}: {
  dataSetIri: string;
  dataSource: DataSource;
  fileName: string;
  fileFormat: FileFormat;
  filters?: QueryFilters;
}) => {
  const locale = useLocale();
  const i18n = useI18n();
  const urqlClient = useClient();
  const [state, dispatch] = useDataDownloadState();
  const download = useCallback(
    async (
      componentsData: ComponentsQuery,
      observationsData: DataCubeObservationsQuery
    ) => {
      if (!(componentsData?.dataCubeByIri && observationsData?.dataCubeByIri)) {
        return;
      }

      const { dimensions, measures } = componentsData.dataCubeByIri;
      const components = [...dimensions, ...measures];
      const dimensionParsers = getDimensionParsers(components, { locale });
      const observations = observationsData.dataCubeByIri.observations.data;
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
          saveAs(new Blob([csv], { type: "text/csv" }), `${fileName}.csv`);
          break;
        case "xlsx":
          const xlsx = await workbook.xlsx.writeBuffer();
          saveAs(
            new Blob([xlsx], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            }),
            `${fileName}.xlsx`
          );
          break;
      }
    },
    [fileFormat, fileName, locale]
  );

  return (
    <Button
      variant="text"
      size="small"
      disabled={state.isDownloading}
      onClick={async () => {
        dispatch({ isDownloading: true });

        try {
          const [componentsResult, observationsResult] = await Promise.all([
            urqlClient
              .query<ComponentsQuery, ComponentsQueryVariables>(
                ComponentsDocument,
                {
                  iri: dataSetIri,
                  sourceType: dataSource.type,
                  sourceUrl: dataSource.url,
                  locale,
                  componentIris: undefined,
                }
              )
              .toPromise(),
            urqlClient
              .query<
                DataCubeObservationsQuery,
                DataCubeObservationsQueryVariables
              >(DataCubeObservationsDocument, {
                iri: dataSetIri,
                sourceType: dataSource.type,
                sourceUrl: dataSource.url,
                locale,
                componentIris: undefined,
                filters,
              })
              .toPromise(),
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
      sx={{ minWidth: 0, p: 0 }}
    >
      {fileFormat.toUpperCase()}
    </Button>
  );
};

export const RunSparqlQuery = ({ url }: { url: string }) => {
  return (
    <Button
      component="a"
      variant="text"
      color="primary"
      size="small"
      href={url}
      target="_blank"
      sx={{ p: 0 }}
    >
      <Typography variant="caption">
        <Trans id="button.download.runsparqlquery.visible">
          Run SPARQL query (visible)
        </Trans>
      </Typography>
    </Button>
  );
};

type DimensionParsers = {
  [iri: string]: (d: string) => any;
};

const getDimensionParsers = (
  components: DimensionMetadataFragment[],
  { locale }: { locale: Locale }
): DimensionParsers => {
  return Object.fromEntries(
    components.map((d) => {
      switch (d.__typename) {
        case "GeoCoordinatesDimension":
        case "GeoShapesDimension":
        case "NominalDimension":
        case "OrdinalDimension":
        case "TemporalOrdinalDimension":
          return [d.iri, (d) => d];
        case "NumericalMeasure":
        case "StandardErrorDimension":
          return [d.iri, (d) => +d];
        case "OrdinalMeasure":
          return d.isNumerical ? [d.iri, (d) => +d] : [d.iri, (d) => d];
        case "TemporalDimension": {
          if (d.timeUnit === "Year") {
            return [d.iri, (d) => +d];
          }

          // We do not want to parse dates as dates, but strings (for easier
          // handling in Excel).
          const dateFormatters = getFormattersForLocale(locale);
          const formatDateAuto = getFormatFullDateAuto(dateFormatters);

          return [
            d.iri,
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
