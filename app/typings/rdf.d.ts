declare module "rdf-cube-view-query" {
  import { AnyPointer, ClownfaceInit } from "clownface";
  import DefaultGraphExt from "rdf-ext/lib/DefaultGraph";
  import { Literal, NamedNode, Term } from "rdf-js";
  import { ParsingClient } from "sparql-http-client/ParsingClient";
  type NodeInit = {
    parent?: Node;
  } & ClownfaceInit;

  export class Node {
    constructor(options: NodeInit);
    ptr: AnyPointer;
    term: AnyPointer["term"];
    out: AnyPointer["out"];
    in: AnyPointer["in"];
    dataset: AnyPointer["dataset"];
    clear(): void;
  }

  export class Cube extends Node {
    static filter: {
      isPartOf: (container: $FixMe) => $FixMe;
      noValidThrough: () => $FixMe;
      noExpires: () => $FixMe;
      in: (predicate: NamedNode, values: NamedNode[]) => $FixMe;
      version: $FixMe;
      status: (values: Term | Term[]) => $FixMe;
    };
    dimensions: CubeDimension[];
    source: CubeSource;
    async fetchShape(): Promise<void>;
  }

  export class CubeDimension {
    path?: Term;
    datatype?: NamedNode;
    minExclusive?: Literal | NamedNode;
    minInclusive?: Literal | NamedNode;
    maxExclusive?: Literal | NamedNode;
    maxInclusive?: Literal | NamedNode;
    in?: (Literal | NamedNode)[];
    out: AnyPointer["out"];
  }

  export class Dimension extends Node {
    clear(): void;
    cubeDimensions: CubeDimension[];
    filter: FilterBuilder;
    source: Source;
  }

  class FilterBuilder {
    constructor(dimension: Dimension);
    eq(arg: $FixMe): Filter;
    ne(arg: $FixMe): Filter;
    lt(arg: $FixMe): Filter;
    gt(arg: $FixMe): Filter;
    lte(arg: $FixMe): Filter;
    gte(arg: $FixMe): Filter;
    in(arg: $FixMe): Filter;
    lang(langs: string[]): Filter;
  }

  class Filter extends Node {
    constructor(
      options: NodeInit & {
        dimension?: Dimension;
        operation?: $FixMe;
        argument?: $FixMe;
      }
    );
    dimension: Term;
    opteration: Term;
    arg: Term;
    args: Term[];
  }

  export class View extends Node {
    constructor(
      options: NodeInit & {
        dimensions?: Dimension[];
        filters?: Filter[];
      }
    );
    static fromCube(cube: Cube): View;
    out: AnyPointer;
    dimensions: Dimension[];
    dimension(options: { cubeDimension: NamedNode | string }): Dimension | null;
    observationsQuery({ disableDistinct }: { disableDistinct?: boolean }): {
      query: $FixMe;
      dimensionMap: Map;
    };
    async observations({
      disableDistinct,
    }: {
      disableDistinct?: boolean;
    }): Promise<Record<string, Literal | NamedNode>[]>;
    addDimension(dimension: Dimension): View;
    createDimension(options: $FixMe): Dimension;
  }
  export class Source extends Node {
    constructor(
      options: NodeInit & {
        endpointUrl: string;
        sourceGraph?: string | DefaultGraphExt;
        user?: string;
        password?: string;
        queryOperation?: "get" | "postUrlencoded" | "postDirect";
        queryPrefix?: string;
      }
    );
    async cube(term: Term | string): Promise<Cube | null>;
    async cubes(options?: {
      noShape?: boolean;
      filters: $FixMe;
    }): Promise<Cube[]>;
    async cubesQuery(options?: { filters: $FixMe }): string;
    client: ParsingClient;
    queryOperation?: "get" | "postUrlencoded" | "postDirect";
  }
  export class LookupSource extends Source {
    static fromSource(source: Source): LookupSource;
    queryPrefix?: string;
  }
  export class CubeSource extends Source {}
}
