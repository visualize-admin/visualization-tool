// eslint-disable-next-line import/order
import { RDFCubeViewQueryMock } from "@/test/cube-view-query-mock";
RDFCubeViewQueryMock;

import { CubeDimension } from "rdf-cube-view-query";
import rdf from "rdf-ext";

import * as ns from "@/rdf/namespace";
import { parseDimensionDatatype } from "@/rdf/parse";

describe("dimension parsing", () => {
  const dimIri = rdf.namedNode("http://example.com/dimension");
  const dimQuads = [
    rdf.quad(dimIri, ns.sh.datatype, ns.xsd.decimal),
    rdf.quad(dimIri, ns.sh.datatype, ns.xsd.float),
  ];
  const dim = new CubeDimension({
    term: dimIri,
    dataset: rdf.dataset(dimQuads),
  });
  it("should be able to parse data type when there are two data types", () => {
    const { dataType } = parseDimensionDatatype(dim);
    expect(dataType.equals(ns.xsd.decimal)).toBe(true);
  });
});
