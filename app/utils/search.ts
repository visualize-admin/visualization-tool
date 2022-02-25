import Fuse from "fuse.js";

import { flatten } from "lodash";
import lunr from "lunr";
import { ResolvedDataCube } from "../graphql/shared-types";

export const wrap = (
  value: string,
  indices: readonly [number, number][],
  options: { tagOpen: string; tagClose: string }
) => {
  let result = "";
  let curIndex = -1;
  for (const [start, end] of indices) {
    if (start !== curIndex) {
      result = result + `${value.substring(curIndex, start)}`;
    }
    result =
      result +
      `${options.tagOpen}${value.substring(start, end + 1)}${options.tagClose}`;
    curIndex = end + 1;
  }
  if (curIndex !== value.length - 1) {
    result += `${value.substring(curIndex)}`;
  }
  return result;
};

/**
 * This pipeline emits "anti-virus" as "antivirus" and "anti" "virus"
 * This is to recognize BAFU acronyms that have an hyphen like "MGM-U"
 *
 * @see https://github.com/olivernn/lunr.js/issues/296
 */
const hyphenator = function (token: lunr.Token) {
  // if there are no hyphens then skip this logic
  if (!token.toString().includes("-")) return token;

  // split the token by hyphens, returning a clone of the original token with the split
  // e.g. 'anti-virus' -> 'anti', 'virus'
  const tokens = token
    .toString()
    .split("-")
    .filter((x) => x !== "")
    .map(function (s) {
      return token.clone(function () {
        return s;
      });
    });

  // clone the token and replace any hyphens
  // e.g. 'anti-virus' -> 'antivirus'
  tokens.push(
    token.clone(function (s) {
      return s.replace("-", "");
    })
  );

  // finally push the original token into the list
  // 'anti-virus' -> 'anti-virus'
  tokens.push(token);

  // send the tokens on to the next step of the pipeline
  return tokens;
};

lunr.tokenizer.separator = /\s+/;

lunr.Pipeline.registerFunction(hyphenator, "hyphenator");

var customHiphenatorPipeline = function (builder: lunr.Builder) {
  builder.pipeline.before(lunr.stemmer, hyphenator);
  builder.searchPipeline.before(lunr.stemmer, hyphenator);
};

const highlightMatch = (match?: Fuse.FuseResultMatch) => {
  return match?.value
    ? wrap(match.value, match.indices, {
        tagOpen: "<strong>",
        tagClose: "</strong>",
      })
    : "";
};

export const searchCubes = (
  cubesByIri: Record<string, ResolvedDataCube>,
  cubesData: ResolvedDataCube["data"][],
  searchTerm: string
) => {
  var idx = lunr(function () {
    const self = this;
    self.use(customHiphenatorPipeline);
    self.ref("iri");
    self.field("title", { boost: 2 });
    self.field("description");
    self.field("publisher");
    self.field("themes");
    self.field("keywords");
    self.field("creator");

    self.metadataWhitelist = ["position"];

    cubesData.forEach(function (doc) {
      const themes = doc.themes?.map((t) => t.label || "").join(" ") ?? "";
      const keywords = doc.keywords?.map((t) => t || "").join(" ") ?? "";
      self.add({
        ...doc,
        themes,
        keywords,
        creator: doc.creator?.label,
      });
      console.log({ themes, keywords, creator: doc.creator?.label });
    }, this);
  });

  const results = idx.query((q) => {
    // exact matches should have the highest boost
    // without the split, query with spaces do not work
    q.term(searchTerm.split(" "), { boost: 100 });

    // prefix matches should be boosted slightly
    q.term(searchTerm, {
      boost: 10,
      usePipeline: false,
      wildcard: lunr.Query.wildcard.TRAILING,
    });

    // finally, try a fuzzy search, without any boost
    q.term(searchTerm, { boost: 1, usePipeline: false, editDistance: 1 });
  });

  return results.map((result) => {
    const cube = cubesByIri[result.ref];
    const titleMatchPositions = flatten(
      Object.values(result.matchData.metadata)
        .filter((o) => o.title)
        .map((o) => o.title.position)
    ).map(([start, length]) => [start, start + length - 1] as [number, number]);
    const descriptionMatchPositions = flatten(
      Object.values(result.matchData.metadata)
        .filter((o) => o.description)
        .map((o) => o.description.position)
    ).map(([start, length]) => [start, start + length - 1] as [number, number]);
    const highlightedTitle = highlightMatch({
      value: cube.data.title,
      indices: titleMatchPositions,
    });
    const highlightedDescription = highlightMatch({
      value: cube.data.description,
      indices: descriptionMatchPositions,
    });
    return { dataCube: cube, highlightedTitle, highlightedDescription };
  });
};
