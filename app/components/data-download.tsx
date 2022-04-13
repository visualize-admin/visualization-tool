import { QueryFilters } from "@/charts/shared/chart-helpers";
import { useLocale } from "@/src";
import { Trans } from "@lingui/macro";
import {
  Button,
  CircularProgress,
  ListSubheader,
  MenuItem,
  Typography,
} from "@mui/material";
import { saveAs } from "file-saver";
import { keyBy } from "lodash";
import {
  bindHover,
  bindMenu,
  usePopupState,
} from "material-ui-popup-state/hooks";
import HoverMenu from "material-ui-popup-state/HoverMenu";
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
import { Observation } from "../domain/data";
import {
  DataCubeObservationsDocument,
  DataCubeObservationsQuery,
  DimensionMetaDataFragment,
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

const prepareData = ({
  dimensions,
  measures,
  observations,
}: {
  dimensions: DimensionMetaDataFragment[];
  measures: DimensionMetaDataFragment[];
  observations: Observation[];
}) => {
  const columns = keyBy([...dimensions, ...measures], (d) => d.iri);
  const data = observations.map((obs) =>
    Object.keys(obs).reduce((acc, key) => {
      const col = columns[key];
      return col
        ? {
            ...acc,
            ...{ [col.label]: obs[key] },
          }
        : acc;
    }, {})
  );
  const columnKeys = Object.keys(columns).map((d) => columns[d].label);

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
    filters,
    title,
  }: {
    title: string;
    dataSetIri: string;
    filters?: QueryFilters;
  }) => {
    return (
      <DataDownloadStateProvider>
        <DataDownloadInnerMenu
          fileName={title}
          dataSetIri={dataSetIri}
          filters={filters}
        />
      </DataDownloadStateProvider>
    );
  }
);

const DataDownloadInnerMenu = ({
  fileName,
  dataSetIri,
  filters,
}: {
  fileName: string;
  dataSetIri: string;
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
        sx={{ p: 0 }}
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
            subheader={
              <Trans id="button.download.data.visible">Filtered dataset</Trans>
            }
            fileName={fileName}
            dataSetIri={dataSetIri}
            filters={filters}
          />
        )}
        <DataDownloadMenuSection
          subheader={<Trans id="button.download.data.all">Full dataset</Trans>}
          fileName={fileName}
          dataSetIri={dataSetIri}
        />
        {state.error && (
          <RawMenuItem>
            <Typography variant="caption">{state.error}</Typography>
          </RawMenuItem>
        )}
      </HoverMenu>
    </>
  );
};

const DataDownloadMenuSection = ({
  subheader,
  fileName,
  dataSetIri,
  filters,
}: {
  subheader: ReactNode;
  fileName: string;
  dataSetIri: string;
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
              fileName={fileName}
              fileFormat={fileFormat}
              dataSetIri={dataSetIri}
              filters={filters}
            />
          ))}
        </Flex>
      </RawMenuItem>
    </>
  );
};

const DownloadMenuItem = ({
  fileName,
  fileFormat,
  dataSetIri,
  filters,
}: {
  fileName: string;
  fileFormat: FileFormat;
  dataSetIri: string;
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
        urqlClient
          .query(DataCubeObservationsDocument, {
            locale,
            iri: dataSetIri,
            dimensions: null,
            filters,
          })
          .toPromise()
          .then(async (result: OperationResult<DataCubeObservationsQuery>) => {
            if (result.data) {
              await download(result.data);
            } else if (result.error) {
              dispatch({ ...state, error: result.error.message });
            }
          })
          .catch((e) => {
            console.error("Could not download the data!", e);
          })
          .finally(() => {
            dispatch({ ...state, isDownloading: false });
          });
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
