const clownface = require("clownface");
const rdf = require("rdf-ext");

const ns = require("./namespaces");

class CubeDimension {
  constructor({ term = rdf.blankNode(), dataset = rdf.dataset(), graph } = {}) {
    this.ptr = clownface({ term, dataset, graph });
  }

  get path() {
    // console.log("path", this.ptr.out(ns.sh.path).term);
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
    return [...(this.ptr.out(ns.sh.in).list() ?? [])].map((item) => item.term);
  }

  out(...args) {
    return this.ptr.out(...args);
  }
}

module.exports = CubeDimension;
