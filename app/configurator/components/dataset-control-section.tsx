import { t, Trans } from "@lingui/macro";
import {
  Box,
  Button,
  IconButton,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import uniqBy from "lodash/uniqBy";
import { useMemo } from "react";

import { useMetadataPanelStoreActions } from "@/components/metadata-panel-store";
import useDisclosure from "@/components/use-disclosure";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useDataCubesMetadataQuery } from "@/graphql/hooks";
import SvgIcAdd from "@/icons/components/IcAdd";
import SvgIcTrash from "@/icons/components/IcTrash";
import { useLocale } from "@/locales/use-locale";

import { DatasetDialog } from "./add-dataset-dialog";
import { FiltersBadge } from "./filters-badge";

export const DatasetsControlSection = () => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const locale = useLocale();
  const commonQueryVariables = {
    sourceType: state.dataSource.type,
    sourceUrl: state.dataSource.url,
    locale,
  };
  const { setOpen, setActiveSection } = useMetadataPanelStoreActions();
  const cubes = useMemo(() => {
    const cubes = uniqBy(
      state.chartConfigs.flatMap((x) => x.cubes),
      (x) => x.iri
    );
    return cubes;
  }, [state.chartConfigs]);
  const [metadataQuery] = useDataCubesMetadataQuery({
    variables: {
      ...commonQueryVariables,
      cubeFilters: cubes.map((cube) => ({
        iri: cube.iri,
      })),
    },
  });
  const {
    isOpen: isDatasetDialogOpen,
    open: openDatasetDialog,
    close: closeDatasetDialog,
  } = useDisclosure();

  const handleDatasetClick = () => {
    setOpen(true);
    setActiveSection("general");
  };

  return (
    <ControlSection collapse>
      <SubsectionTitle titleId="controls-data" gutterBottom={false}>
        <Trans id="controls.section.datasets.title">Data Sources</Trans>{" "}
        <FiltersBadge sx={{ ml: "auto", mr: 4 }} />
      </SubsectionTitle>
      <ControlSectionContent
        aria-labelledby="controls-data"
        data-testid="configurator-filters"
      >
        <Box
          sx={{
            gap: "0.5rem",
            mb: "1rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {metadataQuery.data?.dataCubesMetadata.map((x) => {
            return (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                key={x.iri}
              >
                <div>
                  <MuiLink
                    color="primary"
                    underline="none"
                    sx={{ cursor: "pointer" }}
                    variant="caption"
                    component="span"
                    onClick={handleDatasetClick}
                  >
                    Dataset
                  </MuiLink>
                  <br />
                  <Typography variant="caption">{x.title}</Typography>
                </div>
                <div>
                  {cubes.length > 1 ? (
                    <IconButton
                      onClick={() =>
                        dispatch({
                          type: "DATASET_REMOVE",
                          value: { locale, iri: x.iri },
                        })
                      }
                    >
                      <SvgIcTrash />
                    </IconButton>
                  ) : null}
                </div>
              </Box>
            );
          })}
        </Box>
        <Box>
          {cubes.length === 1 ? (
            <Button
              onClick={openDatasetDialog}
              startIcon={<SvgIcAdd />}
              variant="outlined"
              size="small"
            >
              {t({ id: "chart.datasets.add", message: "Add dataset" })}
            </Button>
          ) : null}
        </Box>
        <DatasetDialog
          state={state}
          open={isDatasetDialogOpen}
          onClose={closeDatasetDialog}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
