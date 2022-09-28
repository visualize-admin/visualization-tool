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

/**
 * From a list of cube rows containing weighted fields
 */
export const computeScores = (
  scoresRaw: any[],
  { query }: { query?: string }
) => {
  const infoPerCube = {} as Record<string, { score: number }>;
  if (query) {
    for (let scoreRow of scoresRaw) {
      let score = 0;
      for (let [field, weight] of Object.entries(weights)) {
        const val = scoreRow[field]?.value;
        if (!val) {
          continue;
        }
        for (let tok of query.split(" ")) {
          if (val.toLowerCase().includes(tok.toLowerCase())) {
            score += weight;
          }
        }
      }
      infoPerCube[scoreRow.cube.value] = { score };
    }
    for (let k of Object.keys(infoPerCube)) {
      if (infoPerCube[k]?.score === 0) {
        delete infoPerCube[k];
      }
    }
  } else {
    for (let scoreRow of scoresRaw) {
      infoPerCube[scoreRow.cube.value] = { score: 1 };
    }
  }
  return infoPerCube;
};

export const highlight = (text: string, query: string) => {
  const re = new RegExp(query.toLowerCase().split(" ").join("|"), "gi");
  return text.replace(re, (m) => `<b>${m}</b>`);
};
