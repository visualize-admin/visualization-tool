const Filter = require("./Filter");
const ns = require("./namespaces");

class FilterBuilder {
  constructor(dimension) {
    this.dimension = dimension;
  }

  eq(arg, options) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.Eq,
      arg,
      ...options,
    });
  }

  ne(arg, options) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.Ne,
      arg,
      ...options,
    });
  }

  lt(arg, options) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.Lt,
      arg,
      ...options,
    });
  }

  gt(arg, options) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.Gt,
      arg,
      ...options,
    });
  }

  lte(arg, options) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.Lte,
      arg,
      ...options,
    });
  }

  gte(arg, options) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.Gte,
      arg,
      ...options,
    });
  }

  in(arg, options) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.In,
      arg,
      ...options,
    });
  }

  lang(arg) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.Lang,
      arg,
      argList: true,
    });
  }

  stardogTextSearch(arg) {
    return new Filter({
      dimension: this.dimension,
      operation: ns.view.StardogTextSearch,
      arg,
      argList: true,
    });
  }
}

module.exports = FilterBuilder;
