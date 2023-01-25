import { Trans } from "@lingui/macro";
import {
  Button,
  CircularProgress,
  ListSubheader,
  MenuItem,
  Typography,
} from "@mui/material";
import { saveAs } from "file-saver";
import keyBy from "lodash/keyBy";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import {
  bindHover,
  bindMenu,
  usePopupState,
} from "material-ui-popup-state/hooks";
import React, {
  createContext,
  Dispatch,
  memo,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { OperationResult, useClient } from "urql";

import { getSortedColumns } from "@/configurator/components/datatable";
import { DataSource, QueryFilters } from "@/configurator/config-types";
import { Observation } from "@/domain/data";
import { useLocale } from "@/src";

import {
  DataCubeObservationsDocument,
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  DimensionMetadataFragment,
} from "../graphql/query-hooks";
import { Icon } from "../icons";

import Flex from "./flex";

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
  dimensions,
  measures,
  observations,
}: {
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
  observations: Observation[];
}) => {
  const columns = keyBy(getSortedColumns(dimensions, measures), (d) => d.iri);
  const data = observations.map((obs) =>
    Object.keys(obs).reduce((acc, key) => {
      const col = columns[key];
      return col
        ? {
            ...acc,
            ...{ [makeColumnLabel(col)]: obs[key] },
          }
        : acc;
    }, {})
  );

  const columnKeys = Object.values(columns).map(makeColumnLabel);

  return { data, columnKeys };
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
          sx: { width: 200 },
        }}
      >
        {filters && (
          <DataDownloadMenuSection
            dataSetIri={dataSetIri}
            dataSource={dataSource}
            subheader={
              <Trans id="button.download.data.visible">Chart dataset</Trans>
            }
            fileName={fileName}
            filters={filters}
          />
        )}
        <DataDownloadMenuSection
          dataSetIri={dataSetIri}
          dataSource={dataSource}
          subheader={<Trans id="button.download.data.all">Full dataset</Trans>}
          fileName={fileName}
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
  const urqlClient = useClient();
  const [state, dispatch] = useDataDownloadState();

  const download = useCallback(
    (fetchedData: DataCubeObservationsQuery) => {
      if (fetchedData?.dataCubeByIri) {
        const { measures, dimensions, observations } =
          fetchedData.dataCubeByIri;
        const preparedData = prepareData({
          dimensions,
          measures,
          observations: observations.data,
        });
        const { columnKeys, data } = preparedData;

        return fetch("/api/download", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            columnKeys,
            data,
            fileFormat,
          }),
        }).then((res) =>
          res.blob().then((blob) => saveAs(blob, `${fileName}.${fileFormat}`))
        );
      }
    },
    [fileFormat, fileName]
  );

  return (
    <Button
      variant="text"
      size="small"
      disabled={state.isDownloading}
      onClick={async () => {
        dispatch({ isDownloading: true });

        try {
          const result: OperationResult<DataCubeObservationsQuery> =
            await urqlClient
              .query<
                DataCubeObservationsQuery,
                DataCubeObservationsQueryVariables
              >(DataCubeObservationsDocument, {
                iri: dataSetIri,
                sourceType: dataSource.type,
                sourceUrl: dataSource.url,
                locale,
                dimensions: null,
                filters,
              })
              .toPromise();

          if (result.data) {
            await download(result.data);
          } else if (result.error) {
            dispatch({ ...state, error: result.error.message });
          }
        } catch (e) {
          console.error("Could not download the data!", e);
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
    <>
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
    </>
  );
};
