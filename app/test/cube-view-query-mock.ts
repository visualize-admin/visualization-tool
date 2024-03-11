import clownface, { AnyPointer } from "clownface";
import rdf from "rdf-ext";
import DatasetExt from "rdf-ext/lib/Dataset";
import DefaultGraphExt from "rdf-ext/lib/DefaultGraph";
import { NamedNode, Term } from "rdf-js";

import * as ns from "@/rdf/namespace";

export const RDFCubeViewQueryMock = jest.mock("rdf-cube-view-query", () => ({
  Node: class {
    constructor() {}
  },
  Source: class {
    constructor() {}
  },
  Cube: class {
    constructor() {}
  },
  CubeDimension: class {
    ptr: AnyPointer;

    constructor({
      term = rdf.blankNode(),
      dataset = rdf.dataset(),
      graph = rdf.defaultGraph(),
    }: {
      term?: Term;
      dataset?: DatasetExt;
      graph?: DefaultGraphExt;
    } = {}) {
      this.ptr = clownface({ term, dataset, graph });
    }

    get path() {
      return this.ptr.out(ns.sh.path).term;
    }

    get optional() {
      const optionalDatatype = this.ptr
        .out(ns.sh.or)
        .out(ns.sh.datatype)
        .filter((d) => ns.cube.Undefined.equals(d.term)).term;
      const optionalValue = this.in.some((v) => ns.cube.Undefined.equals(v));

      return Boolean(optionalDatatype || optionalValue);
    }

    get datatype() {
      const nonOptional = this.ptr.out(ns.sh.datatype).term;
      const withOptional = this.ptr
        .out(ns.sh.or)
        .out(ns.sh.datatype)
        .filter((d) => !ns.cube.Undefined.equals(d.term)).term;

      return nonOptional || withOptional;
    }

    get minExclusive() {
      return this.ptr.out(ns.sh.minExclusive).term;
    }

    get minInclusive() {
      return this.ptr.out(ns.sh.minInclusive).term;
    }

    get maxExclusive() {
      return this.ptr.out(ns.sh.maxExclusive).term;
    }

    get maxInclusive() {
      return this.ptr.out(ns.sh.maxInclusive).term;
    }

    get in() {
      return [...(this.ptr.out(ns.sh.in).list() ?? [])].map(
        (item) => item.term
      );
    }

    out(...args: NamedNode[]) {
      return this.ptr.out(...args);
    }
  },
}));
