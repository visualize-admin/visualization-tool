import rdf from "rdf-ext";
import { NamedNode } from "rdf-js";

import { truthy } from "@/domain/types";
import {
  SearchCubeFilter,
  SearchCubeFilterType,
} from "@/graphql/resolver-types";
import { ExtendedCube } from "@/rdf/extended-cube";
import * as ns from "@/rdf/namespace";

import isAttrEqual from "../utils/is-attr-equal";

const where = (predicate: NamedNode, object: NamedNode) => {
  return ({ cube }: $FixMe) => [[cube, predicate, object]];
};

const isVisualizeCubeFilter = where(
  ns.schema.workExample,
  rdf.namedNode("https://ld.admin.ch/application/visualize")
);

export const makeInQueryFilter = (
  predicate: NamedNode,
  filters: SearchCubeFilter[]
) => {
  return filters.length > 0
    ? ExtendedCube.filter.in(
        predicate,
        filters.map((x) => rdf.namedNode(x.value))
      )
    : null;
};

export const makeCubeFilters = ({
  includeDrafts,
  filters,
}: {
  includeDrafts: boolean;
  filters?: SearchCubeFilter[];
}) => {
  const themeQueryFilter = makeInQueryFilter(
    ns.dcat.theme,
    filters?.filter(isAttrEqual("type", SearchCubeFilterType.DataCubeTheme)) ??
      []
  );
  const orgQueryFilter = makeInQueryFilter(
    ns.dcterms.creator,
    filters?.filter(
      isAttrEqual("type", SearchCubeFilterType.DataCubeOrganization)
    ) ?? []
  );
  const aboutQueryFilter = makeInQueryFilter(
    ns.schema.about,
    filters?.filter(isAttrEqual("type", SearchCubeFilterType.DataCubeAbout)) ??
      []
  );

  const res = [
    // Cubes that have a newer version published have a schema.org/expires property; Only show cubes that don't have it
    ExtendedCube.filter.noExpires(),
    isVisualizeCubeFilter,
    includeDrafts
      ? null
      : ExtendedCube.filter.status([
          ns.adminVocabulary("CreativeWorkStatus/Published"),
        ]),
    themeQueryFilter,
    orgQueryFilter,
    aboutQueryFilter,
  ].filter(truthy);

  debugger;
  return res;
};
