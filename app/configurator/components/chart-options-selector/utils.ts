import { t } from "@lingui/macro";
import groupBy from "lodash/groupBy";

import { SelectOption, SelectOptionGroup } from "@/components/form";
import { Component, DataCubeMetadata } from "@/domain/data";
import { isJoinByCube } from "@/graphql/join";

export const makeGetFieldOptionGroups =
  ({ cubesMetadata }: { cubesMetadata: DataCubeMetadata[] }) =>
  ({
    fieldComponents,
    getOption,
  }: {
    fieldComponents: Component[];
    getOption: (component: Component) => SelectOption;
  }): SelectOptionGroup[] => {
    const fieldComponentsByCubeIri = groupBy(fieldComponents, (d) => d.cubeIri);

    return Object.entries(fieldComponentsByCubeIri).map(([cubeIri, dims]) => {
      return [
        {
          label: isJoinByCube(cubeIri)
            ? t({ id: "dimension.joined" })
            : cubesMetadata.find((d) => d.iri === cubeIri)?.title,
          value: cubeIri,
        },
        dims.map(getOption),
      ];
    });
  };
