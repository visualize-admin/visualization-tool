const rdf = require("rdf-ext");

function findDataset(objects) {
  const datasets = new Set(objects.map((object) => object.dataset));

  if (datasets.size > 1) {
    throw new Error("all child objects must be created from the same View");
  }

  if (datasets.size === 1) {
    return [...datasets][0];
  }

  return undefined;
}

function isParentOf(a, b) {
  while (b) {
    if (a === b) {
      return true;
    }

    b = b.parent;
  }

  return false;
}

function findParent(objects) {
  if ([...objects].length === 0) {
    return undefined;
  }

  const parents = new Set();

  for (const object of objects) {
    parents.add(object.parent);
  }

  if (parents.size === 0) {
    return [...parents][0];
  }

  let parent = [...parents][0];
  parents.delete(parent);

  while (parent) {
    if ([...parents].every((other) => isParentOf(parent, other))) {
      return parent;
    }

    parent = parent.parent;
  }

  return undefined;
}

function toTerm(object) {
  // Array
  if (Array.isArray(object)) {
    return object.map((item) => toTerm(item));
  }

  // API object
  if (object.ptr) {
    return object.ptr.term;
  }

  // clownface object
  if (object.term) {
    return object.term;
  }

  // RDF/JS term
  if (object.termType) {
    return object;
  }

  if (typeof object === "string") {
    return rdf.namedNode(object);
  }

  return null;
}

function objectSetterGetter(
  obj,
  property,
  value,
  { map = (v) => v, ptr = obj.ptr } = {}
) {
  if (typeof value === "undefined") {
    const term = ptr.out(property).term;

    return term ? map(term.value) : null;
  }

  if (value === null) {
    ptr.deleteOut(property);
  } else {
    ptr.addOut(property, value);
  }

  return obj;
}

module.exports = {
  findDataset,
  findParent,
  objectSetterGetter,
  toTerm,
};
