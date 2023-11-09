import {
  HierarchyNode,
  getHierarchy,
} from "@zazuko/cube-hierarchy-query/index";
import { AnyPointer } from "clownface";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { StreamClient } from "sparql-http-client";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { parseTerm } from "@/domain/data";
import { truthy } from "@/domain/types";
import { HierarchyValue } from "@/graphql/resolver-types";
import { ResolvedDimension } from "@/graphql/shared-types";

import * as ns from "./namespace";
import { getCubeDimensionValuesWithMetadata } from "./queries";
import {
  getOptionsFromTree,
  mapTree,
  pruneTree,
  regroupTrees,
} from "./tree-utils";

const getName = (pointer: AnyPointer, language: string) => {
  const name = pointer.out(ns.schema.name, { language })?.value;
  if (name) {
    return name;
  }
  return pointer.out(ns.schema.name)?.value;
};

const toTree = (
  results: HierarchyNode[],
  dimensionIri: string,
  locale: string
): HierarchyValue[] => {
  const sortChildren = (children: HierarchyValue[]) =>
    orderBy(children, ["position", "identifier"]);
  const serializeNode = (
    node: HierarchyNode,
    depth: number
  ): HierarchyValue | undefined => {
    const name = getName(node.resource, locale);
    // TODO Find out why some hierachy nodes have no label. We filter
    // them out at the moment
    // @see https://zulip.zazuko.com/#narrow/stream/40-bafu-ext/topic/labels.20for.20each.20hierarchy.20level/near/312845

    const identifier = parseTerm(node.resource.out(ns.schema.identifier)?.term);
    const res: HierarchyValue | undefined = name
      ? {
          label: name || "-",
          alternateName: node.resource.out(ns.schema.alternateName).term?.value,
          value: node.resource.value,
          children: sortChildren(
            node.nextInHierarchy
              .map((childNode) => serializeNode(childNode, depth + 1))
              .filter(truthy)
              .filter((d) => d.label)
          ),
          position: parseTerm(node.resource.out(ns.schema.position).term),
          identifier,
          depth,
          dimensionIri,
        }
      : undefined;
    return res;
  };

  return sortChildren(results.map((r) => serializeNode(r, 0)).filter(truthy));
};

const getDimensionHierarchies = async (
  cube: Cube,
  dimensionIri: string,
  locale: string
) => {
  const cubeIri = cube.term?.value;

  if (!cubeIri) {
    throw new Error("Cube must have an iri!");
  }

  // Can't rely on the cube here, because sometimes it might contain duplicate
  // hierarchies, due to fetching both cube and shape when cube is initialized.
  // Here we are only interested in shape hierarchies, that's why we don't have
  // to initialize the cube, but rather just fetch its shape.
  const hierarchyCube = new Cube({
    source: cube.source,
    term: rdf.namedNode(cubeIri),
  });
  // Need to set the shape query manually, because we didn't initialize the cube,
  // thus can't access its observationConstraint.
  hierarchyCube.shapeQuery = () => {
    return `DESCRIBE <${cube.out(ns.cube.observationConstraint)}>`;
  };
  await hierarchyCube.fetchShape();
  const hierarchies = hierarchyCube.ptr
    .any()
    .has(ns.sh.path, rdf.namedNode(dimensionIri))
    .has(ns.cubeMeta.inHierarchy)
    .out(ns.cubeMeta.inHierarchy)
    .toArray();

  return uniqBy(hierarchies, (hierarchy) => getName(hierarchy, locale));
};

export const queryHierarchy = async (
  rdimension: ResolvedDimension,
  locale: string,
  sparqlClient: ParsingClient,
  sparqlClientStream: StreamClient,
  cache: LRUCache | undefined
): Promise<HierarchyValue[] | null> => {
  const {
    cube,
    data: { iri },
  } = rdimension;
  const hierarchyPointers = await getDimensionHierarchies(cube, iri, locale);

  if (hierarchyPointers.length === 0) {
    return null;
  }

  const dimensionValuesWithLabels = await getCubeDimensionValuesWithMetadata({
    cube: rdimension.cube,
    dimension: rdimension.dimension,
    sparqlClient,
    locale,
    cache,
  });

  const hierarchies = await Promise.all(
    hierarchyPointers.map(async (pointer) => {
      return {
        // @ts-ignore
        nodes: await getHierarchy(pointer).execute(sparqlClientStream, rdf),
        hierarchyName: getName(pointer, locale),
      };
    })
  );

  const trees = hierarchies.map(({ nodes, hierarchyName }) => {
    const tree: (HierarchyValue & {
      hierarchyName?: string;
    })[] = toTree(nodes, iri, locale);

    if (tree.length > 0) {
      // Augment hierarchy value with hierarchyName so that when regrouping
      // below, we can create the fake nodes
      tree[0].hierarchyName = hierarchyName;
    }
    return tree;
  });

  const tree = regroupTrees(trees);

  const treeValues = new Set(getOptionsFromTree(tree).map((d) => d.value));
  const dimensionValues = new Set(
    dimensionValuesWithLabels.map((d) => `${d.value}`)
  );
  const prunedTree = mapTree(
    pruneTree(tree, (node) => dimensionValues.has(node.value)),
    (node) => ({ ...node, hasValue: dimensionValues.has(node.value) })
  );
  const additionalTreeValues = dimensionValuesWithLabels
    .filter((d) => !treeValues.has(`${d.value}`))
    .map(
      (d) =>
        ({
          label: d.label || "ADDITIONAL",
          value: `${d.value}`,
          depth: -1,
          children: [],
          dimensionIri: rdimension.data.iri,
          hasValue: true,
          position: "-1",
          identifier: "",
        } as HierarchyValue)
    );

  return [...prunedTree, ...additionalTreeValues];
};
