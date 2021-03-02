declare module "rdf-cube-view-query" {
  import { Clownface, ClownfaceInit } from "clownface";
  import { Term, NamedNode, Literal } from "rdf-js";
  import { ParsingClient } from "sparql-http-client/ParsingClient";
  type NodeInit = {
    parent?: Node;
  } & ClownfaceInit;

  export class Node {
    constructor(options: NodeInit);
    ptr: Clownface;
    get term(): Clownface["term"];
    get dataset(): Clownface["dataset"];
    clear(): void;
  }

  export class Cube extends Node {
    out: Clownface["out"];
    dimensions: CubeDimension[];
  }

  export class CubeDimension {
    path: Term;
    datatype: NamedNode;
    minExclusive: Term;
    minInclusive: Term;
    maxExclusive: Term;
    maxInclusive: Term;
    in: Term[];
    out: Clownface["out"];
  }

  export class Dimension extends Node {
    clear(): void;
    cubeDimensions: CubeDimension[];
    filter: FilterBuilder;
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
    out: Clownface["out"];
    dimensions: Dimension[];
    dimension(options: { cubeDimension: NamedNode }): Dimension | null;
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
      }
    );
    async cube(term: Term | string): Promise<Cube | null>;
    async cubes(): Promise<Cube[]>;
    client: ParsingClient;
  }
  export class LookupSource extends Source {
    static fromSource(source: Source): LookupSource;
  }
  export class CubeSource extends Source {}
}
