import { Trans } from "@lingui/macro";
import {
  Box,
  Button,
  CircularProgress,
  ListItemIcon,
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
import React, { memo, useCallback, useMemo, useState } from "react";
import { useQueryFilters } from "../charts/shared/chart-helpers";
import { ChartConfig } from "../configurator";
import { Observation } from "../domain/data";
import {
  DimensionMetaDataFragment,
  Maybe,
  useDataCubeObservationsQuery,
} from "../graphql/query-hooks";
import { Icon } from "../icons";
import { useLocale } from "../locales/use-locale";

const EXTENTS = ["visible", "all"] as const;
type Extent = typeof EXTENTS[number];

const FILE_FORMATS = ["csv", "xlsx"] as const;
export type FileFormat = typeof FILE_FORMATS[number];

const OPTIONS_TO_RENDER = EXTENTS.flatMap((extent) =>
  FILE_FORMATS.map((fileFormat) => ({ extent, fileFormat }))
);

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

const usePreparedAllData = ({ dataSetIri }: { dataSetIri: string }) => {
  const locale = useLocale();
  const [{ data: fetchedData }] = useDataCubeObservationsQuery({
    variables: {
      locale,
      iri: dataSetIri,
      dimensions: null,
      filters: null,
    },
  });
  const { data, columnKeys } = useMemo(() => {
    if (fetchedData?.dataCubeByIri) {
      const { dimensions, measures, observations } = fetchedData.dataCubeByIri;
      return {
        ...prepareData({
          dimensions,
          measures,
          observations: observations.data,
        }),
      };
    } else {
      return { data: [], columnKeys: [] };
    }
  }, [fetchedData?.dataCubeByIri]);

  return { data, columnKeys };
};

const usePreparedVisibleData = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
}) => {
  const locale = useLocale();
  const filters = useQueryFilters({ chartConfig });
  const [{ data: fetchedData }] = useDataCubeObservationsQuery({
    variables: { locale, iri: dataSetIri, dimensions: null, filters },
  });
  const { data, columnKeys, sparqlEditorUrl } = useMemo(() => {
    if (fetchedData?.dataCubeByIri) {
      const { dimensions, measures, observations } = fetchedData.dataCubeByIri;
      return {
        ...prepareData({
          dimensions,
          measures,
          observations: observations.data,
        }),
        sparqlEditorUrl: fetchedData.dataCubeByIri.observations.sparqlEditorUrl,
      };
    } else {
      return { data: [], columnKeys: [], sparqlEditorUrl: undefined };
    }
  }, [fetchedData?.dataCubeByIri]);

  return { data, columnKeys, sparqlEditorUrl };
};

export const AllAndVisibleDataDownloadMenu = memo(
  ({
    dataSetIri,
    title,
    chartConfig,
  }: {
    dataSetIri: string;
    title: string;
    chartConfig: ChartConfig;
  }) => {
    const allPrepared = usePreparedAllData({ dataSetIri });
    const visiblePrepared = usePreparedVisibleData({ dataSetIri, chartConfig });
    const optionsToRender = useMemo(
      () =>
        OPTIONS_TO_RENDER.map((d) => ({
          ...d,
          columnKeys:
            d.extent === "all"
              ? allPrepared.columnKeys
              : visiblePrepared.columnKeys,
          data: d.extent === "all" ? allPrepared.data : visiblePrepared.data,
        })),
      [allPrepared, visiblePrepared]
    );

    return (
      <DataDownloadInnerMenu
        title={title}
        optionsToRender={optionsToRender}
        sparqlEditorUrl={visiblePrepared.sparqlEditorUrl}
      />
    );
  }
);

export const AllDataDownloadMenu = memo(
  ({ dataSetIri, title }: { dataSetIri: string; title: string }) => {
    const { columnKeys, data } = usePreparedAllData({ dataSetIri });
    const optionsToRender = useMemo(
      () =>
        OPTIONS_TO_RENDER.filter((d) => d.extent === "all").map((d) => ({
          ...d,
          columnKeys,
          data,
        })),
      [data, columnKeys]
    );

    return (
      <DataDownloadInnerMenu title={title} optionsToRender={optionsToRender} />
    );
  }
);

const DataDownloadInnerMenu = ({
  title,
  optionsToRender,
  sparqlEditorUrl,
}: {
  title: string;
  optionsToRender: {
    extent: Extent;
    fileFormat: FileFormat;
    columnKeys: string[];
    data: Observation[];
  }[];
  sparqlEditorUrl?: Maybe<string>;
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
        <Typography variant="body2">
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
        }}
      >
        {optionsToRender.map((d) => (
          <DownloadMenuItem
            key={d.extent + d.fileFormat}
            title={title}
            extent={d.extent}
            fileFormat={d.fileFormat}
            columnKeys={d.columnKeys}
            data={d.data}
            onDownloaded={popupState.close}
          />
        ))}
      </HoverMenu>
      {sparqlEditorUrl && (
        <>
          <Box sx={{ display: "inline", mx: 2 }}>·</Box>
          <RunSparqlQuery url={sparqlEditorUrl} />
        </>
      )}
    </>
  );
};

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
      sx={{ paddingY: 3 }}
    >
      <ListItemIcon sx={{ color: "primary.main" }}>
        {isDownloading ? <CircularProgress /> : <Icon name="table" />}
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{ variant: "body2", color: "primary.main" }}
      >
        {extent === "visible" ? (
          <>
            <Trans id="button.download.data.visible">Visible dataset</Trans> (
            {fileFormat.toUpperCase()})
          </>
        ) : (
          <>
            <Trans id="button.download.data.all">Full dataset</Trans> (
            {fileFormat.toUpperCase()})
          </>
        )}
      </ListItemText>
    </MenuItem>
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
        <Typography variant="body2">
          <Trans id="button.download.runsparqlquery.visible">
            Run SPARQL query (visible)
          </Trans>
        </Typography>
      </Button>
    </>
  );
};
