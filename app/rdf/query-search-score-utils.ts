export const parseFloatZeroed = (s: string) => {
  const n = parseFloat(s);
  if (Number.isNaN(n)) {
    return 0;
  } else {
    return n;
  }
};

export const weights: Record<string, number> = {
  name: 5,
  description: 2,
  themeName: 1,
  publisher: 1,
  creatorLabel: 1,
};

const isStopword = (d: string) => {
  return d.length < 3 && d.toLowerCase() === d;
};

/**
 * From a list of cube rows containing weighted fields
 */
export const computeScores = (
  scoresRaw: any[],
  {
    query,
    identifierName,
    lang,
  }: {
    query?: string | null;
    identifierName: string;
    lang?: string | null;
  }
) => {
  const infoPerCube = {} as Record<string, { score: number }>;
  if (query) {
    for (let scoreRow of scoresRaw) {
      let score = 0;
      for (let [field, weight] of Object.entries(weights)) {
        const val = scoreRow[field]?.toLowerCase();

        if (!val) {
          continue;
        }

        for (let tok of query.split(" ").filter((d) => !isStopword(d))) {
          if (val.includes(tok.toLowerCase())) {
            score += weight;
          }
        }

        // Bonus points for exact match.
        if (val.includes(query.toLowerCase())) {
          score += weight * 2;
        }
      }

      // Cubes with properties in the current language get a bonus,
      // as generally we expect the user to be interested in those.
      if (scoreRow["lang"] === lang) {
        score *= 1.5;
      }

      if (
        infoPerCube[scoreRow[identifierName]] === undefined ||
        score > infoPerCube[scoreRow[identifierName]].score
      ) {
        infoPerCube[scoreRow[identifierName]] = { score };
      }
    }
    for (let k of Object.keys(infoPerCube)) {
      if (infoPerCube[k]?.score === 0) {
        delete infoPerCube[k];
      }
    }
  } else {
    for (let scoreRow of scoresRaw) {
      infoPerCube[scoreRow[identifierName]] = { score: 1 };
    }
  }
  return infoPerCube;
};

export const highlight = (text: string, query: string) => {
  const re = new RegExp(query.toLowerCase().split(" ").join("|"), "gi");
  return text.replace(re, (m) => `<b>${m}</b>`);
};
