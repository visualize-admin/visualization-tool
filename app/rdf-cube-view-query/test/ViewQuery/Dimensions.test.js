const { strictEqual } = require("assert");
const { describe, it } = require("mocha");

const ns = require("../support/namespaces");
const Dimensions = require("../../lib/query/ViewQuery/Dimensions.js");
const { parse } = require("../support/utils");

describe("Dimensions", () => {
  it("gets the property from view:as", () => {
    const view = parse`
        ${ns.ex.view} a ${ns.view.View} ;
          ${ns.view.dimension} [
                ${ns.view.from} [
                    ${ns.view.path} ${ns.ex.someOther} 
                ] ;
                ${ns.view.as} ${ns.ex.some} ;
            ] .
    `.node(ns.ex.view);

    const dimensions = new Dimensions({ view, variable: () => {} });

    strictEqual(ns.ex.some.value, dimensions.array[0].property.value);
  });

  it("gets the property from path when view:as is not defined and path is an IRI", () => {
    const view = parse`
        ${ns.ex.view} a ${ns.view.View} ;
          ${ns.view.dimension} [
                ${ns.view.from} [
                    ${ns.view.path} ${ns.ex.someOther} 
                ] ;
            ] .
      `.node(ns.ex.view);

    const dimensions = new Dimensions({ view, variable: () => {} });

    strictEqual(ns.ex.someOther.value, dimensions.array[0].property.value);
  });

  it("gets a blank as property when view:as is not defined and path is a list", () => {
    const view = parse`
        ${ns.ex.view} a ${ns.view.View} ;
          ${ns.view.dimension} [
                ${ns.view.from} [
                    ${ns.view.path} (
                      ${ns.ex.some}
                      ${ns.ex.someOther} 
                    ) ;
                ] ;
            ] .
      `.node(ns.ex.view);

    const dimensions = new Dimensions({ view, variable: () => {} });

    strictEqual("BlankNode", dimensions.array[0].property.termType);
  });

  it("gets a blank as property when view:as is not defined and path is a blank", () => {
    const view = parse`
        ${ns.ex.view} a ${ns.view.View} ;
          ${ns.view.dimension} [
                ${ns.view.from} [
                    ${ns.view.path} [ ${ns.ex.notMe} ${ns.ex.please} ] ;
                ] ;
            ] .
      `.node(ns.ex.view);

    const dimensions = new Dimensions({ view, variable: () => {} });

    strictEqual("BlankNode", dimensions.array[0].property.termType);
  });

  it("does not set isResult flag when dimension is not used in projection", () => {
    const view = parse`
      ${ns.ex.view} a ${ns.view.View} ;
        ${ns.view.projection} [
          ${ns.view.columns} ( _:dimension ) ;
        ] ;
        ${ns.view.dimension} _:dimension, _:excluded .
        
      _:dimension ${ns.view.from} [
        ${ns.view.path} ${ns.ex.some} 
      ] .
      
      _:excluded ${ns.view.from} [
        ${ns.view.path} ${ns.ex.notThat} 
      ] .
    `.node(ns.ex.view);

    const dimensions = new Dimensions({ view, variable: () => {} });

    const exSome = dimensions.array.find((dim) =>
      dim.property.equals(ns.ex.some)
    );
    const exNotThat = dimensions.array.find((dim) =>
      dim.property.equals(ns.ex.notThat)
    );
    strictEqual(true, exSome.isResult);
    strictEqual(false, exNotThat.isResult);
  });

  it("sets isResult flag when there is no projection", () => {
    const view = parse`
      ${ns.ex.view} a ${ns.view.View} ;
        ${ns.view.dimension} _:dimension .
        
      _:dimension ${ns.view.from} [
        ${ns.view.path} ${ns.ex.some} 
      ] .
    `.node(ns.ex.view);

    const dimensions = new Dimensions({ view, variable: () => {} });

    strictEqual(true, dimensions.array[0].isResult);
  });

  it("sets isFilter flag when dimension is used in a filter", () => {
    const view = parse`
      ${ns.ex.view} a ${ns.view.View} ;
        ${ns.view.dimension} _:dimension ;
        ${ns.view.filter} [ ${ns.view.dimension} _:dimension ; ] ;
      .
        
      _:dimension ${ns.view.from} [
        ${ns.view.path} ${ns.ex.some} 
      ] .
    `.node(ns.ex.view);

    const dimensions = new Dimensions({ view, variable: () => {} });

    strictEqual(true, dimensions.array[0].isFilter);
  });
});
