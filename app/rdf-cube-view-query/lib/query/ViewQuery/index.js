const rdf = require("rdf-ext");
const sparql = require("rdf-sparql-builder");
const Dimensions = require("./Dimensions");
const Filters = require("./Filters");
const Patterns = require("./Patterns");
const Result = require("./Result");
const Sources = require("./Sources");

class ViewQuery {
  constructor(ptr, { disableDistinct } = {}) {
    this.varCounts = {};

    this.view = ptr;
    this.disableDistinct = disableDistinct;

    this.dimensions = new Dimensions(this);
    this.result = new Result(this);
    this.sources = new Sources(this);

    this.patterns = new Patterns(this);
    this.filters = new Filters(this);

    this.build();
  }

  variable(prefix) {
    this.varCounts[prefix] = this.varCounts[prefix] || 0;

    return rdf.variable(`${prefix}${this.varCounts[prefix]++}`);
  }

  build() {
    let queryNoOffsetLimit;

    if (this.disableDistinct) {
      queryNoOffsetLimit = sparql
        .select(this.result.buildProjection())
        .where([
          ...this.patterns.buildPatterns(),
          ...this.filters.buildFilters(),
        ])
        .orderBy(this.result.buildOrderBy());
    } else {
      queryNoOffsetLimit = sparql
        .select(this.result.buildProjection(), { distinct: true })
        .where([
          ...this.patterns.buildPatterns(),
          ...this.filters.buildFilters(),
        ])
        .groupBy(this.result.buildGroupyByModifier())
        .having(this.filters.buildHavings())
        .orderBy(this.result.buildOrderBy());
    }

    this.query = this.result.addOffsetLimit(queryNoOffsetLimit.clone());

    this.countQuery = sparql
      .select(["(COUNT(*) AS ?count)"])
      .where([queryNoOffsetLimit]);
  }
}

module.exports = ViewQuery;
