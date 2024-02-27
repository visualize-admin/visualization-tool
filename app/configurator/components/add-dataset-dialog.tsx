import { t } from "@lingui/macro";
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
import { ObjectInspector } from "react-inspector";

import { DatasetResults } from "@/browser/dataset-browse";
import { ConfiguratorStateConfiguringChart } from "@/configurator";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
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
  const [cubesComponentQuery] = useDataCubesComponentsQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: state.chartConfigs[0].cubes.map((cube) => ({
        iri: cube.iri,
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
    ev.preventDefault();
    const formdata = Object.fromEntries(
      new FormData(ev.currentTarget).entries()
    );
    setQuery(formdata.name as string);
  };
  const handleClose: DialogProps["onClose"] = useEventCallback((ev) => {
    props.onClose?.(ev, "escapeKeyDown");
    setQuery("");
  });
  return (
    <Dialog {...props} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ typography: "h2" }}>
        {t({
          id: "chart.datasets.add-dataset-dialog.title",
          message: "Select dataset with shared dimensions",
        })}
      </DialogTitle>
      <DialogContent>
        <ObjectInspector data={cubesComponentQuery} />
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
        />
      </DialogContent>
    </Dialog>
  );
};
