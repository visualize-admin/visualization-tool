import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { ComponentProps } from "react";
import { CombinedError } from "urql";

import { DatasetResult, DatasetResultProps } from "@/browse/ui/dataset-result";
import { Loading, LoadingDataError } from "@/components/hint";
import { SearchCube } from "@/domain/data";
import { SearchCubeResult } from "@/graphql/query-hooks";

export type DatasetResultsProps = ComponentProps<typeof DatasetResults>;

export const DatasetResults = ({
  fetching,
  error,
  cubes,
  datasetResultProps,
}: {
  fetching: boolean;
  error?: CombinedError;
  cubes: SearchCubeResult[];
  datasetResultProps?: ({
    cube,
  }: {
    cube: SearchCube;
  }) => Partial<DatasetResultProps>;
}) => {
  if (fetching) {
    return <Loading />;
  }

  if (error) {
    return <LoadingDataError message={error.message} />;
  }

  if (cubes.length === 0) {
    return (
      <Typography
        variant="h2"
        sx={{ mt: 8, color: "grey.600", textAlign: "center" }}
      >
        <Trans id="No results">No results</Trans>
      </Typography>
    );
  }

  return (
    <div>
      {cubes.map(({ cube, highlightedTitle, highlightedDescription }) => (
        <DatasetResult
          key={cube.iri}
          dataCube={cube}
          highlightedTitle={highlightedTitle}
          highlightedDescription={highlightedDescription}
          {...datasetResultProps?.({ cube })}
        />
      ))}
    </div>
  );
};
