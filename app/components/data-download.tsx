import { Trans } from "@lingui/macro";
import {
  Box,
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
import Flex from "./flex";

const FILE_FORMATS = ["csv", "xlsx"] as const;
export type FileFormat = typeof FILE_FORMATS[number];

type PreparedData = {
  columnKeys: string[];
  data: Observation[];
  sparqlEditorUrl: Maybe<string> | undefined;
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

const usePreparedAllData = ({
  dataSetIri,
}: {
  dataSetIri: string;
}): PreparedData => {
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
      return { data: [], columnKeys: [], sparqlEditorUrl: undefined };
    }
  }, [fetchedData?.dataCubeByIri]);

  return { data, columnKeys, sparqlEditorUrl: undefined };
};

const usePreparedVisibleData = ({
  dataSetIri,
  chartConfig,
}: {
  dataSetIri: string;
  chartConfig: ChartConfig;
}): PreparedData => {
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
    const preparedAllData = usePreparedAllData({ dataSetIri });
    const preparedVisibleData = usePreparedVisibleData({
      dataSetIri,
      chartConfig,
    });

    return (
      <DataDownloadInnerMenu
        fileName={title}
        visibleDataToRender={preparedVisibleData}
        allDataToRender={preparedAllData}
        sparqlEditorUrl={preparedVisibleData.sparqlEditorUrl}
      />
    );
  }
);

export const AllDataDownloadMenu = memo(
  ({ dataSetIri, title }: { dataSetIri: string; title: string }) => {
    const preparedAllData = usePreparedAllData({ dataSetIri });
    return (
      <DataDownloadInnerMenu
        fileName={title}
        allDataToRender={preparedAllData}
      />
    );
  }
);

const DataDownloadInnerMenu = ({
  fileName,
  visibleDataToRender,
  allDataToRender,
  sparqlEditorUrl,
}: {
  fileName: string;
  visibleDataToRender?: PreparedData;
  allDataToRender: PreparedData;
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
      {sparqlEditorUrl && (
        <>
          <Box sx={{ display: "inline", mx: 2 }}>·</Box>
          <RunSparqlQuery url={sparqlEditorUrl} />
        </>
      )}
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
