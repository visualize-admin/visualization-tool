import { QueryFilters } from "@/charts/shared/chart-helpers";
import { useLocale } from "@/src";
import { Trans } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import { Button, ListSubheader, MenuItem, Typography } from "@mui/material";
import { saveAs } from "file-saver";
import { keyBy } from "lodash";
import {
  bindHover,
  bindMenu,
  usePopupState,
} from "material-ui-popup-state/hooks";
import HoverMenu from "material-ui-popup-state/HoverMenu";
import React, { memo, ReactNode, useCallback, useState } from "react";
import { OperationResult, useClient } from "urql";
import { Observation } from "../domain/data";
import {
  DataCubeObservationsDocument,
  DataCubeObservationsQuery,
  DimensionMetaDataFragment,
} from "../graphql/query-hooks";
import { Icon } from "../icons";
import Flex from "./flex";

const FILE_FORMATS = ["csv", "xlsx"] as const;
export type FileFormat = typeof FILE_FORMATS[number];

type PreparedData = {
  columnKeys: string[];
  data: Observation[];
};

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
      <DataDownloadInnerMenu
        fileName={title}
        dataSetIri={dataSetIri}
        filters={filters}
      />
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
        startIcon={<Icon name="download" />}
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
          sx: { minWidth: "200px" },
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
            onDownloaded={() => popupState.close()}
          />
        )}
        <DataDownloadMenuSection
          subheader={<Trans id="button.download.data.all">Full dataset</Trans>}
          fileName={fileName}
          dataSetIri={dataSetIri}
          onDownloaded={() => popupState.close()}
        />
      </HoverMenu>
    </>
  );
};

const DataDownloadMenuSection = ({
  subheader,
  fileName,
  dataSetIri,
  filters,
  onDownloaded,
}: {
  subheader: ReactNode;
  fileName: string;
  dataSetIri: string;
  filters?: QueryFilters;
  onDownloaded: () => void;
}) => {
  return (
    <>
      <ListSubheader sx={{ mt: 3, lineHeight: 1.2, borderBottom: "none" }}>
        {subheader}
      </ListSubheader>
      <MenuItem
        sx={{
          "&:hover": { backgroundColor: "transparent", cursor: "default" },
        }}
      >
        <Flex sx={{ gap: 3 }}>
          {FILE_FORMATS.map((fileFormat) => (
            <DownloadMenuItem
              key={fileFormat}
              fileName={fileName}
              fileFormat={fileFormat}
              dataSetIri={dataSetIri}
              filters={filters}
              onDownloaded={onDownloaded}
            />
          ))}
        </Flex>
      </MenuItem>
    </>
  );
};

const DownloadMenuItem = ({
  fileName,
  fileFormat,
  dataSetIri,
  filters,
  onDownloaded,
}: {
  fileName: string;
  fileFormat: FileFormat;
  dataSetIri: string;
  filters?: QueryFilters;
  onDownloaded: () => void;
}) => {
  const locale = useLocale();
  const urqlClient = useClient();
  const [isDownloading, setIsDownloading] = useState(false);
  const download = useCallback(
    (preparedData: PreparedData) => {
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
    },
    [fileFormat, fileName]
  );

  return (
    <LoadingButton
      variant="text"
      size="small"
      loading={isDownloading}
      onClick={async () => {
        setIsDownloading(true);
        urqlClient
          .query(DataCubeObservationsDocument, {
            locale,
            iri: dataSetIri,
            dimensions: null,
            filters,
          })
          .toPromise()
          .then(async (result: OperationResult<DataCubeObservationsQuery>) => {
            const { data } = result;

            if (data?.dataCubeByIri) {
              const { measures, dimensions, observations } = data.dataCubeByIri;
              const preparedData = prepareData({
                dimensions,
                measures,
                observations: observations.data,
              });

              await download(preparedData);
            }
          })
          .catch((e) => {
            console.error("Could not download the data!", e);
          })
          .finally(() => {
            setIsDownloading(false);
            onDownloaded();
          });
      }}
      sx={{ minWidth: 0, p: 0 }}
    >
      {fileFormat.toUpperCase()}
    </LoadingButton>
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
