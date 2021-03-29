declare module "rdf-cube-view-query" {
  import { AnyPointer, ClownfaceInit } from "clownface";
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
      status: (values: Term) => $FixMe;
    };
    dimensions: CubeDimension[];
    source: CubeSource;
  }

  export class CubeDimension {
    path?: Term;
    datatype: NamedNode;
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
    observationsQuery(): { query: $FixMe; dimensionMap: Map };
    async observations(): Promise<Record<string, Literal | NamedNode>[]>;
    addDimension(dimension: Dimension): View;
    createDimension(options: $FixMe): Dimension;
  }
  export class Source extends Node {
    constructor(
      options: NodeInit & {
        endpointUrl: string;
        sourceGraph?: string;
        user?: string;
        password?: string;
        queryOperation?: "get" | "postUrlencoded" | "postDirect";
      }
    );
    async cube(term: Term | string): Promise<Cube | null>;
    async cubes(options?: { filters: $FixMe }): Promise<Cube[]>;
    client: ParsingClient;
    queryOperation?: "get" | "postUrlencoded" | "postDirect";
  }
  export class LookupSource extends Source {
    static fromSource(source: Source): LookupSource;
  }
  export class CubeSource extends Source {}
}
