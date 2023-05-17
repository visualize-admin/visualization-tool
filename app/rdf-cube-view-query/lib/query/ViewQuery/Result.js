const sparql = require("rdf-sparql-builder");
const ns = require("../../namespaces");
const { contains } = require("../utils");

class Result {
  constructor(viewQuery) {
    this.viewQuery = viewQuery;

    this.projection = this.viewQuery.view.out(ns.view.projection);

    this.columns = [...this.projection.out(ns.view.columns).list()];

    this.order = [...this.projection.out(ns.view.orderBy).list()].map(
      (condition) => {
        if (condition.term.termType === "BlankNode") {
          return {
            dimension: condition.out(ns.view.dimension).term,
            direction: condition.out(ns.view.direction).term,
          };
        }

        return {
          dimension: condition.term,
          direction: ns.view.Ascending,
        };
      }
    );

    this.offset = null;

    if (this.projection.out(ns.view.offset).term) {
      this.offset = parseInt(this.projection.out(ns.view.offset).value);
    }

    this.limit = null;

    if (this.projection.out(ns.view.limit).term) {
      this.limit = parseInt(this.projection.out(ns.view.limit).value);
    }
  }

  buildProjection() {
    if (this.columns.length > 0) {
      return this.columns.map((column) => {
        const dimension = this.viewQuery.dimensions.get(column.term);

        return this.buildDimensionProjection(dimension);
      });
    }

    return this.viewQuery.dimensions.array
      .filter((d) => d.isResult)
      .map((dimension) => this.buildDimensionProjection(dimension));
  }

  buildGroupyByModifier() {
    if (this.columns.length > 0) {
      return this.columns.map((column) => {
        const dimension = this.viewQuery.dimensions.get(column.term);

        return dimension.variable;
      });
    }

    return this.viewQuery.dimensions.array
      .filter((d) => d.isResult && !d.isAggregate)
      .map((dimension) => dimension.variable);
  }

  buildOrderBy() {
    return this.order.map((condition) => {
      return [
        this.viewQuery.dimensions.get(condition.dimension).variable,
        condition.direction.equals(ns.view.Descending) ? "DESC" : "ASC",
      ];
    });
  }

  addOffsetLimit(query) {
    if (this.offset !== null) {
      query = query.offset(this.offset);
    }

    if (this.limit !== null) {
      query = query.limit(this.limit);
    }

    return query;
  }

  buildDimensionProjection(dimension) {
    if (!dimension.isAggregate) {
      return dimension.variable;
    }

    const aggregate = dimension.ptr.out(ns.view.aggregate);

    if (contains(aggregate, ns.view.Min)) {
      return sparql.min(dimension.variable);
    }

    if (contains(aggregate, ns.view.Max)) {
      return sparql.max(dimension.variable);
    }

    if (contains(aggregate, ns.view.Avg)) {
      return sparql.avg(dimension.variable);
    }

    throw new Error(`unknow aggregate ${aggregate.value}`);
  }
}

module.exports = Result;
