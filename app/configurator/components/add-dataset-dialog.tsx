import { t } from "@lingui/macro";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  InputAdornment,
  TextField,
  useEventCallback,
} from "@mui/material";
import { FormEvent, useMemo, useState } from "react";

import { DatasetResults, PartialSearchCube } from "@/browser/dataset-browse";
import {
  ConfiguratorStateConfiguringChart,
  isConfiguring,
  useConfiguratorState,
} from "@/configurator";
import { DataCubeComponents } from "@/domain/data";
import {
  executeDataCubesComponentsQuery,
  useDataCubesComponentsQuery,
} from "@/graphql/hooks";
import {
  SearchCubeResultOrder,
  useSearchCubesQuery,
} from "@/graphql/query-hooks";
import SvgIcSearch from "@/icons/components/IcSearch";
import { useLocale } from "@/locales/use-locale";

export const DatasetDialog = ({
  state,
  ...props
}: { state: ConfiguratorStateConfiguringChart } & DialogProps) => {
  const [query, setQuery] = useState("");
  const locale = useLocale();

  const commonQueryVariables = {
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };

  const activeChartConfig = state.chartConfigs.find(
    (x) => x.key === state.activeChartKey
  );
  if (!activeChartConfig) {
    throw new Error("Could not find active chart config");
  }
  const [cubesComponentQuery] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: activeChartConfig.cubes.slice(0, 1).map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
      })),
    },
  });

  const relevantDimensions = useMemo(() => {
    return (
      cubesComponentQuery.data?.dataCubesComponents.dimensions.filter((x) => {
        return x.__typename === "TemporalDimension";
      }) ?? []
    );
  }, [cubesComponentQuery.data?.dataCubesComponents.dimensions]);

  const [searchQuery] = useSearchCubesQuery({
    variables: {
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      query: query,
      order: SearchCubeResultOrder.Score,
      includeDrafts: false,
      filters: relevantDimensions.flatMap((rd) =>
        rd.__typename === "TemporalDimension"
          ? [{ type: "TemporalDimension", value: rd.timeUnit }]
          : []
      ),
    },
    pause: !cubesComponentQuery.data || relevantDimensions.length === 0,
  });
  const handleSubmit = (ev: FormEvent<HTMLFormElement>) => {
    console.log("handle submit");
    ev.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(ev.currentTarget).entries()
    );
    setQuery(formdata.search as string);
  };
  const handleClose: DialogProps["onClose"] = useEventCallback((ev) => {
    props.onClose?.(ev, "escapeKeyDown");
    setQuery("");
  });
  return (
    <Dialog {...props} onClose={handleClose} maxWidth="lg" fullWidth>
      {query}
      <DialogTitle sx={{ typography: "h2" }}>
        {t({
          id: "chart.datasets.add-dataset-dialog.title",
          message: "Select dataset with shared dimensions",
        })}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            name="search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SvgIcSearch />
                </InputAdornment>
              ),
            }}
            placeholder={t({ id: "dataset.search.placeholder" })}
          />
          <Button color="primary" variant="outlined" type="submit">
            {t({ id: "dataset.search.label" })}
          </Button>
        </form>
        <DatasetResults
          cubes={searchQuery.data?.searchCubes ?? []}
          fetching={searchQuery.fetching}
          error={searchQuery.error}
          rowActions={(cube) => {
            const currentComponents =
              cubesComponentQuery.data?.dataCubesComponents;
            if (!currentComponents) {
              return null;
            }
            return (
              <AddDatasetButton
                currentComponents={currentComponents}
                otherCube={cube}
              />
            );
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

const inferJoinBy = (
  leftComponents: DataCubeComponents,
  rightComponents: DataCubeComponents
) => {
  const leftDim = leftComponents.dimensions.find(
    (x) => x.__typename === "TemporalDimension"
  );
  const rightDim = rightComponents.dimensions.find(
    (x) => x.__typename === "TemporalDimension"
  );
  if (!leftDim?.iri || !rightDim?.iri) {
    throw new Error(
      `Could not find dimensions on which to join: ${JSON.stringify({
        leftDim,
        rightDim,
      })}`
    );
  }

  return {
    left: leftDim.iri,
    right: rightDim.iri,
  };
};

const AddDatasetButton = ({
  currentComponents,
  otherCube,
}: {
  currentComponents: DataCubeComponents;
  otherCube: PartialSearchCube;
}) => {
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const { type: sourceType, url: sourceUrl } = state.dataSource;
  const locale = useLocale();
  const handleClick = async () => {
    const iri = otherCube.iri;
    setLoading(true);
    try {
      const componentQueryResult = await executeDataCubesComponentsQuery({
        locale: locale,
        sourceType,
        sourceUrl,
        cubeFilters: [{ iri }],
      });

      if (componentQueryResult.error || !componentQueryResult.data) {
        throw new Error(
          `Could not fetch cube to add: ${componentQueryResult.error}`
        );
      }

      const joinBy = inferJoinBy(
        currentComponents,
        componentQueryResult.data.dataCubesComponents
      );
      dispatch({
        type: "DATASET_ADD",
        value: {
          iri,
          joinBy: joinBy,
        },
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <LoadingButton
      size="small"
      variant="contained"
      loading={loading}
      onClick={handleClick}
    >
      {t({
        id: "dataset.search.add-dataset",
        message: "Add dataset",
      })}
    </LoadingButton>
  );
};
