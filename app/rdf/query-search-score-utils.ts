import { ParsedRawSearchCube } from "./query-search";

export const parseFloatZeroed = (s: string) => {
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
};

export const weights = {
  title: 5,
  description: 2,
  themeLabel: 1,
  publisher: 1,
  creatorLabel: 1,
  subthemeLabel: 1,
};
export const exactMatchPoints = weights.title * 2;

const isStopword = (d: string) => {
  return d.length < 3 && d.toLowerCase() === d;
};

/**
 * From a list of cube rows containing weighted fields
 */
export const computeScores = (
  cubes: ParsedRawSearchCube[],
  { query }: { query?: string | null }
) => {
  const infoPerCube: Record<string, { score: number }> = {};

  if (query) {
    for (const cube of cubes) {
      let score = 1;

      for (const [field, weight] of Object.entries(weights) as [
        keyof typeof weights,
        number
      ][]) {
        const value = cube[field]?.toLowerCase();

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

export const highlight = (text: string, query: string) => {
  const re = new RegExp(query.toLowerCase().split(" ").join("|"), "gi");
  return text.replace(re, (m) => `<b>${m}</b>`);
};
