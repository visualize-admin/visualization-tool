const rdf = require("rdf-ext");
const sparql = require("rdf-sparql-builder");
const ns = require("../namespaces");

const filter = {};

filter.operation = (predicate, value, operation) => {
  return ({ cube, index }) => {
    const variable = rdf.variable(`v${index}`);
    let filter = null;

    if (operation.equals(ns.view.Eq)) {
      filter = sparql.eq(variable, value);
    } else if (operation.equals(ns.view.Ne)) {
      filter = sparql.ne(variable, value);
    } else if (operation.equals(ns.view.Lt)) {
      filter = sparql.lt(variable, value);
    } else if (operation.equals(ns.view.Gt)) {
      filter = sparql.gt(variable, value);
    } else if (operation.equals(ns.view.Lte)) {
      filter = sparql.lte(variable, value);
    } else if (operation.equals(ns.view.Gte)) {
      filter = sparql.gte(variable, value);
    } else if (operation.equals(ns.view.In)) {
      filter = sparql.in(variable, value);
    }

    if (!filter) {
      throw new Error(`unknown operation: ${operation}`);
    }

    return [[cube, predicate, variable], sparql.filter([filter])];
  };
};

filter.eq = (predicate, value) =>
  filter.operation(predicate, value, ns.view.Eq);
filter.ne = (predicate, value) =>
  filter.operation(predicate, value, ns.view.Ne);
filter.lt = (predicate, value) =>
  filter.operation(predicate, value, ns.view.Lt);
filter.gt = (predicate, value) =>
  filter.operation(predicate, value, ns.view.Gt);
filter.lte = (predicate, value) =>
  filter.operation(predicate, value, ns.view.Lte);
filter.gte = (predicate, value) =>
  filter.operation(predicate, value, ns.view.Gte);
filter.in = (predicate, values) =>
  filter.operation(predicate, values, ns.view.In);

filter.notExists = (predicate, value) => {
  return ({ cube, index }) => {
    value = value || rdf.variable(`v${index}`);

    return [
      sparql.filter([
        `NOT EXISTS { ${rdf.quad(cube, predicate, value).toString()} }`,
      ]),
    ];
  };
};

filter.patternIn = (predicate, subject) => {
  return ({ cube, index }) => {
    const variable = rdf.variable(`v${index}`);

    return [[subject || variable, predicate, cube]];
  };
};

module.exports = filter;
