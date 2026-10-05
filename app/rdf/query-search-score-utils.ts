import { SearchCube } from "@/domain/data";

export const fields = {
  title: {
    weight: 5,
    fn: (d: SearchCube) => d.title,
  },
  description: {
    weight: 2,
    fn: (d: SearchCube) => d.description,
  },
  creatorLabel: {
    weight: 1,
    fn: (d: SearchCube) => d.creator?.label ?? "",
  },
  publisher: {
    weight: 1,
    fn: () => "",
  },
  themeLabels: {
    weight: 1,
    fn: (d: SearchCube) => d.themes.map((d) => d.label).join(" "),
  },
  subthemeLabels: {
    weight: 1,
    fn: (d: SearchCube) => d.subthemes.map((d) => d.label).join(" "),
  },
};
export const exactMatchPoints = fields.title.weight * 2;

const isStopword = (d: string) => {
  return d.length < 3 && d.toLowerCase() === d;
};

/**
 * From a list of cube rows containing weighted fields
 */
export const computeScores = (
  cubes: SearchCube[],
  { query }: { query?: string | null }
) => {
  const infoPerCube: Record<string, { score: number }> = {};

  if (query) {
    for (const cube of cubes) {
      // If a cube has been found, it has at least a score of 1.
      let score = 1;

      for (const [_field, { weight, fn }] of Object.entries(fields) as [
        keyof typeof fields,
        { weight: number; fn: (cube: SearchCube) => string },
      ][]) {
        const value = fn(cube)?.toLowerCase();

        if (!value) {
          continue;
        }

        for (const token of query.split(" ").filter((d) => !isStopword(d))) {
          if (value.includes(token.toLowerCase())) {
            score += weight;
          }
        }

        // Bonus points for exact match.
        if (value.includes(query.toLowerCase())) {
          score += exactMatchPoints;
        }
      }

      if (
        infoPerCube[cube.iri] === undefined ||
        score > infoPerCube[cube.iri].score
      ) {
        infoPerCube[cube.iri] = { score };
      }
    }
  } else {
    for (const cube of cubes) {
      infoPerCube[cube.iri] = { score: 1 };
    }
  }

  return infoPerCube;
};

const escapeHtml = (text: string) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const escapeRegExp = (text: string) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Wraps the parts of `text` matching `query` in `<b>` tags.
 *
 * The text comes from remote cube metadata and the query from user input, so both
 * are escaped: the text as HTML, since the result is rendered as markup, and the
 * query as a regular expression, so that special characters (e.g. "C++") are
 * matched literally instead of throwing or matching unexpectedly.
 */
export const highlight = (text: string, query: string) => {
  const tokens = query
    .split(" ")
    .filter((d) => d !== "")
    .map((d) => escapeRegExp(d));

  if (!tokens.length) {
    return escapeHtml(text);
  }

  const re = new RegExp(`(${tokens.join("|")})`, "gi");

  // Odd indices contain the captured matches.
  return text
    .split(re)
    .map((part, i) =>
      i % 2 === 1 ? `<b>${escapeHtml(part)}</b>` : escapeHtml(part)
    )
    .join("");
};
