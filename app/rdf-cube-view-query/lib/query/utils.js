const clownface = require("clownface");
const TermSet = require("@rdfjs/term-set");

function contains(ptr, target) {
  if (!target) {
    return ptr.terms.length > 0;
  }

  if (target.term) {
    target = target.term;
  }

  if (target.ptr && target.ptr.term) {
    target = target.ptr.term;
  }

  return ptr.terms.some((term) => term.equals(target));
}

function distinct(...ptrs) {
  const ptr = ptrs[0];
  const termSet = new TermSet();

  for (const ptr of ptrs) {
    for (const term of ptr.terms) {
      termSet.add(term);
    }
  }

  const terms = [...termSet];

  if (terms.length === 0) {
    return ptr;
  }

  return clownface({
    dataset: ptr._context[0].dataset,
    term: terms,
    graph: ptr._context[0].graph,
  });
}

function toPropertyPath(ptr) {
  const list = ptr.list();

  if (!list) {
    return ptr.term;
  }

  return [...list].map((property) => property.term);
}

module.exports = {
  contains,
  distinct,
  toPropertyPath,
};
