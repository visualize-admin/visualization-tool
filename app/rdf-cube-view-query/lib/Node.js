const clownface = require("clownface");
const rdf = require("rdf-ext");

class Node {
  constructor({ parent, term = rdf.blankNode(), dataset, graph }) {
    this.parent = parent;

    this.ptr = clownface({
      term,
      dataset: dataset || (parent && parent.dataset) || rdf.dataset(),
      graph,
    });

    this.children = new Set();

    if (this.parent) {
      this.parent.children.add(this);
    }
  }

  get term() {
    return this.ptr.term;
  }

  get dataset() {
    return this.ptr.dataset;
  }

  clear() {
    if (this.parent) {
      this._detach();
    }

    for (const child of this.children) {
      child.clear();
    }

    this.ptr.deleteOut();
  }

  _detach() {
    this.parent.children.delete(this);
  }
}

module.exports = Node;
