import { Trans } from "@lingui/macro";
import {
  Button,
  CircularProgress,
  ListItemText,
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
import React, { memo, ReactNode, useCallback, useMemo, useState } from "react";
import { Observation } from "../domain/data";
import {
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

const usePreparedData = (
  data: DataCubeObservationsQuery | undefined
): PreparedData | undefined => {
  const preparedData = useMemo(() => {
    if (data?.dataCubeByIri) {
      const { observations, dimensions, measures } = data.dataCubeByIri;
      return prepareData({
        dimensions,
        measures,
        observations: observations.data,
      });
    }
  }, [data?.dataCubeByIri]);

  return preparedData;
};

export const DataDownloadMenu = memo(
  ({
    allData,
    visibleData,
    title,
  }: {
    allData: DataCubeObservationsQuery | undefined;
    visibleData?: DataCubeObservationsQuery | undefined;
    title: string;
  }) => {
    const preparedAllData = usePreparedData(allData);
    const preparedVisibleData = usePreparedData(visibleData);

    return preparedAllData ? (
      <DataDownloadInnerMenu
        fileName={title}
        visibleDataToRender={preparedVisibleData}
        allDataToRender={preparedAllData}
      />
    ) : null;
  }
);

const DataDownloadInnerMenu = ({
  fileName,
  visibleDataToRender,
  allDataToRender,
}: {
  fileName: string;
  visibleDataToRender?: PreparedData;
  allDataToRender: PreparedData;
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
        sx={{ fontWeight: "regular", padding: 0 }}
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
        {visibleDataToRender && (
          <DataDownloadMenuSection
            subheader={
              <Trans id="button.download.data.visible">Filtered dataset</Trans>
            }
            dataToRender={visibleDataToRender}
            fileName={fileName}
            onDownloaded={() => popupState.close()}
          />
        )}
        {allDataToRender && (
          <DataDownloadMenuSection
            subheader={
              <Trans id="button.download.data.all">Full dataset</Trans>
            }
            dataToRender={allDataToRender}
            fileName={fileName}
            onDownloaded={() => popupState.close()}
          />
        )}
      </HoverMenu>
    </>
  );
};

const DataDownloadMenuSection = ({
  subheader,
  dataToRender,
  fileName,
  onDownloaded,
}: {
  subheader: ReactNode;
  dataToRender: PreparedData;
  fileName: string;
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
              columnKeys={dataToRender.columnKeys}
              data={dataToRender.data}
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
  data,
  columnKeys,
  fileFormat,
  onDownloaded,
}: {
  fileName: string;
  data: Observation[];
  columnKeys: string[];
  fileFormat: FileFormat;
  onDownloaded: () => void;
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const download = useCallback(() => {
    return fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnKeys, data, fileFormat }),
    }).then((res) =>
      res.blob().then((blob) => saveAs(blob, `${fileName}.${fileFormat}`))
    );
  }, [columnKeys, data, fileFormat, fileName]);

  return (
    <Button
      variant="text"
      size="small"
      endIcon={isDownloading ? <CircularProgress /> : null}
      onClick={async () => {
        setIsDownloading(true);
        await download();
        onDownloaded();
        setIsDownloading(false);
      }}
      sx={{
        padding: 0,
        minWidth: 0,
        pointerEvents: isDownloading ? "none" : "auto",
      }}
    >
      <ListItemText
        primaryTypographyProps={{ variant: "body2", color: "primary.main" }}
      >
        {fileFormat.toUpperCase()}
      </ListItemText>
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
        sx={{ fontWeight: "regular", padding: 0 }}
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
