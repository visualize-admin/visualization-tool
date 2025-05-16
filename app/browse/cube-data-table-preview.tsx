import { useMemo } from "react";

import { DataTablePreview } from "@/browse/data-table-preview";
import { getSortedComponents } from "@/browse/utils";
import { Loading } from "@/components/hint";
import { Dimension, Measure, Observation } from "@/domain/data";

export const CubeDataTablePreview = ({
  title,
  dimensions,
  measures,
  observations,
}: {
  title: string;
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observation[] | undefined;
}) => {
  const sortedComponents = useMemo(() => {
    return getSortedComponents([...dimensions, ...measures]);
  }, [dimensions, measures]);

  return observations ? (
    <DataTablePreview
      title={title}
      sortedComponents={sortedComponents}
      observations={observations}
      linkToMetadataPanel={false}
    />
  ) : (
    <Loading />
  );
};
