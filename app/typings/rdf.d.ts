declare module "rdf-cube-view-query" {
  import { AnyPointer, ClownfaceInit } from "clownface";
  import DatasetExt from "rdf-ext/lib/Dataset";
  import DefaultGraphExt from "rdf-ext/lib/DefaultGraph";
  import { Literal, NamedNode, Quad, Term } from "rdf-js";
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
    dataset: DatasetExt;
    clear(): void;
  }

  export type CubeOptions = NodeInit & {
    source?: Source;
    term?: Term;
    queryPrefix?: string;
  };

  export class Cube extends Node {
    constructor(options: CubeOptions);
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
    cubeQuery(): string;
    shapeQuery(): string;
    async fetchCube(): Promise<void>;
    async fetchShape(): Promise<void>;
    async init(): Promise<void>;
    quads: Quad[];
  }

  export class CubeDimension {
    constructor({
      term,
      dataset,
      graph,
    }: {
      term: Term;
      dataset?: DatasetExt;
      graph?: Term;
    });
    ptr: AnyPointer;
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
    static fromCube(cube: Cube, sortColumns?: boolean): View;
    out: AnyPointer;
    dimensions: Dimension[];
    dimension(options: { cubeDimension: NamedNode | string }): Dimension | null;
    observationsQuery({ disableDistinct }: { disableDistinct?: boolean }): {
      query: $FixMe;
      previewQuery: $FixMe;
      dimensionMap: Map;
    };
    async observations({
      disableDistinct,
    }: {
      disableDistinct?: boolean;
    }): Promise<Record<string, Literal | NamedNode>[]>;
    async preview(options: {
      limit?: number;
      offset?: number;
    }): Promise<Record<string, Literal | NamedNode>[]>;
    addDimension(dimension: Dimension): View;
    createDimension(options: $FixMe): Dimension;
    setDefaultColumns(): void;
    getMainSource(): Source;
  }

  export type SourceOptions = NodeInit & {
    sourceGraph?: string | DefaultGraphExt;
    queryOperation?: "get" | "postUrlencoded" | "postDirect";
    queryPrefix?: string;
    term?: Term;
  } & (
      | {
          endpointUrl: string;
          user?: string;
          password?: string;
        }
      | {
          client?: ParsingClient;
        }
    );
  export class Source extends Node {
    constructor(options: SourceOptions);
    async cube(term: Term | string): Promise<Cube | null>;
    endpoint: string;
    async cubes(options?: {
      noShape?: boolean;
      filters: $FixMe;
    }): Promise<Cube[]>;
    async cubesQuery(options?: { filters: $FixMe }): string;
    client: ParsingClient;
    queryOperation?: "get" | "postUrlencoded" | "postDirect";
    graph: Term;
  }

  export class LookupSource extends Source {
    static fromSource(source: Source): LookupSource;
    queryPrefix?: string;
  }

  export class CubeSource extends Source {}
}
