import { Trans } from "@lingui/macro";
import {
  Button,
  CircularProgress,
  Link,
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
import React, { memo, useCallback, useMemo, useState } from "react";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { ChartConfig } from "../configurator";
import { Observation } from "../domain/data";
import { useDataCubeObservationsQuery } from "../graphql/query-hooks";
import { Icon } from "../icons";
import { useLocale } from "../locales/use-locale";
import Flex from "./flex";

const EXTENTS = ["visible", "all"] as const;
type Extent = typeof EXTENTS[number];

const FILE_FORMATS = ["csv", "xlsx"] as const;
export type FileFormat = typeof FILE_FORMATS[number];

const OPTIONS_TO_RENDER = EXTENTS.flatMap((extent) =>
  FILE_FORMATS.map((fileFormat) => ({ extent, fileFormat }))
);

const PADDING_PROPS = { paddingX: "24px", paddingY: "12px" };

const usePreparedData = ({
  dataSetIri,
  chartConfig,
  extent,
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
  extent: Extent;
}) => {
  const locale = useLocale();
  const filters = useQueryFilters({ chartConfig });
  const [{ data: fetchedData }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      dimensions: null,
      filters: extent === "all" ? null : filters,
    },
  });
  const { data, columnKeys } = useMemo(() => {
    if (fetchedData?.dataCubeByIri) {
      const { dimensions, measures, observations } = fetchedData.dataCubeByIri;
      const columns = keyBy([...dimensions, ...measures], (d) => d.iri);
      const data = observations.data.map((obs) =>
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
    } else {
      return { data: [], columnKeys: [] };
    }
  }, [fetchedData?.dataCubeByIri]);

  return { data, columnKeys };
};

export const DataDownloadMenu = memo(
  ({
    dataSetIri,
    title,
    chartConfig,
  }: {
    dataSetIri: string;
    title: string;
    chartConfig: ChartConfig;
  }) => {
    const allPrepared = usePreparedData({
      dataSetIri,
      chartConfig,
      extent: "all",
    });
    const visiblePrepared = usePreparedData({
      dataSetIri,
      chartConfig,
      extent: "visible",
    });
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
          startIcon={<Icon name="download" size={16} />}
          {...bindHover(popupState)}
          sx={{ fontWeight: "regular" }}
        >
          <Trans id="button.download">Download</Trans>
        </Button>
        <HoverMenu
          {...bindMenu(popupState)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Typography
            sx={{
              ...PADDING_PROPS,
              borderBottom: "1px solid",
              borderBottomColor: "grey.500",
            }}
          >
            Download
          </Typography>
          {OPTIONS_TO_RENDER.map((d) => (
            <DownloadMenuItem
              key={d.extent + d.fileFormat}
              title={title}
              extent={d.extent}
              fileFormat={d.fileFormat}
              onDownloaded={popupState.close}
              {...(d.extent === "all" ? allPrepared : visiblePrepared)}
            />
          ))}
        </HoverMenu>
      </>
    );
  }
);

const DownloadMenuItem = ({
  title,
  data,
  columnKeys,
  extent,
  fileFormat,
  onDownloaded,
}: {
  title: string;
  data: Observation[];
  columnKeys: string[];
  extent: Extent;
  fileFormat: FileFormat;
  onDownloaded: () => void;
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const download = useCallback(() => {
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
      res.blob().then((blob) => saveAs(blob, `${title}.${fileFormat}`))
    );
  }, [columnKeys, data, fileFormat, title]);

  return (
    <MenuItem
      onClick={async () => {
        setIsDownloading(true);
        await download();
        onDownloaded();
        setIsDownloading(false);
      }}
      sx={{ ...PADDING_PROPS }}
    >
      <Flex sx={{ alignItems: "center", color: "primary.main", gap: 2 }}>
        {isDownloading ? (
          <CircularProgress size={16} />
        ) : (
          <Icon name="table" color="primary.main" size={16} />
        )}
        <Typography variant="body2">
          {extent === "visible" ? (
            <>
              <Trans id="button.download.data.visible">
                Overlooking dataset
              </Trans>{" "}
              ({fileFormat.toUpperCase()})
            </>
          ) : (
            <>
              <Trans id="button.download.data.all">Full dataset</Trans> (
              {fileFormat.toUpperCase()})
            </>
          )}
        </Typography>
      </Flex>
    </MenuItem>
  );
};

const RunSparqlQuery = ({ url, extent }: { url: string; extent: Extent }) => {
  return (
    <Link
      component="button"
      color="primary"
      underline="hover"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {extent === "visible" ? (
        <Trans id="button.download.runsparqlquery.visible">
          Run SPARQL query (visible)
        </Trans>
      ) : (
        <Trans id="button.download.runsparqlquery.all">
          Run SPARQL query (all)
        </Trans>
      )}
    </Link>
  );
};
