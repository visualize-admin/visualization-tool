import clownface, { AnyPointer } from "clownface";
import rdf from "rdf-ext";
import DatasetExt from "rdf-ext/lib/Dataset";
import DefaultGraphExt from "rdf-ext/lib/DefaultGraph";
import { NamedNode, Term } from "rdf-js";
import { createClient, defaultExchanges } from "urql";

import { GRAPHQL_ENDPOINT } from "@/domain/env";
import * as ns from "@/rdf/namespace";

jest.mock("@mapbox/tiny-sdf", () => {
  return {
    default: () => {},
  };
});

jest.mock("nanoid", () => {
  return {
    nanoid: () => "nanoid",
  };
});

jest.mock("react-markdown", () => {
  return {
    ReactMarkdown: () => null,
  };
});

jest.mock("rehype-raw", () => {
  return {
    rehypeRaw: () => null,
  };
});

jest.mock("rehype-sanitize", () => {
  return {
    rehypeSanitize: () => null,
  };
});

jest.mock("remark-gfm", () => {
  return {
    remarkGfm: () => null,
  };
});

jest.mock("@mdxeditor/editor", () => {
  return {
    realmPlugin: () => {},
  };
});

jest.mock("@mdxeditor/gurx", () => {
  return {
    Action: () => {},
    Cell: () => {},
    Signal: () => {},
  };
});

// @ts-ignore Ignoring cannot be compiled as isolated module warning. It's working.
jest.mock("@lingui/macro", () => {
  return {
    // Since it's a macro, it's not defined at runtime, maybe in the future
    // we should add a transformer so that jest files are transformed the same
    // way as app files so that the macro is defined inside files that are ran by Jest.
    defineMessage: (x: string) => x,
  };
});

jest.mock("@/graphql/client", () => {
  return {
    client: createClient({
      url: GRAPHQL_ENDPOINT,
      exchanges: [...defaultExchanges],
    }),
  };
});

jest.mock("rdf-cube-view-query", () => ({
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

jest.mock("@zazuko/cube-hierarchy-query/index", () => ({}));

jest.mock("@interactivethings/swiss-federal-ci", () => ({
  c: {
    cobalt: {},
    monochrome: {},
    red: {},
  },
  t: {},
}));
jest.mock("@interactivethings/swiss-federal-ci/dist/components", () => {});
jest.mock(
  "@interactivethings/swiss-federal-ci/dist/components/pages-router",
  () => {}
);
