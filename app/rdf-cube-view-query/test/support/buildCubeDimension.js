const CubeDimension = require("../../lib/CubeDimension");
const clownface = require("clownface");
const rdf = require("rdf-ext");
const ns = require("./namespaces");

function buildCubeDimension({
  shape,
  path,
  datatype,
  nodeKind = "Literal",
  optional = false,
  values = [],
}) {
  if (!shape) {
    shape = clownface({ term: rdf.blankNode(), dataset: rdf.dataset() });
  }

  if (path) {
    shape.addOut(ns.sh.path, path);
  }

  if (nodeKind) {
    if (nodeKind === "Literal") {
      shape.addOut(ns.sh.nodeKind, ns.sh.Literal);
    }

    if (nodeKind === "NamedNode") {
      shape.addOut(ns.sh.nodeKind, ns.sh.IRI);
    }
  }

  if (datatype) {
    if (optional) {
      if (nodeKind === "Literal") {
        shape
          .addOut(ns.sh.or, (union) =>
            union.addOut(ns.sh.datatype, ns.cube.Undefined)
          )
          .addOut(ns.sh.or, (union) => union.addOut(ns.sh.datatype, datatype));
      }
    } else {
      shape.addOut(ns.sh.datatype, datatype);
    }
  }

  if (values.length > 0 || (optional && nodeKind === "NamedNode")) {
    if (optional && nodeKind === "NamedNode") {
      values.push(ns.cube.Undefined);
    }

    shape.addList(ns.sh.in, values);
  }

  return new CubeDimension(shape);
}

module.exports = buildCubeDimension;
