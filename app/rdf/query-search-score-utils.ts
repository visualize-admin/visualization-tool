import { ResultRow } from "sparql-http-client/ResultParser";

export const parseFloatZeroed = (s: string) => {
  const n = parseFloat(s);
  if (Number.isNaN(n)) {
    return 0;
  } else {
    return n;
  }
};

const parseScoreRow = (x: ResultRow) => {
  return {
    cubeIri: x.cube.value,
    scoreName: parseFloatZeroed(x.scoreName?.value),
    scoreDescription: parseFloatZeroed(x.scoreDescription?.value),
    scoreTheme: parseFloatZeroed(x.scoreTheme?.value),
    scorePublisher: parseFloatZeroed(x.scorePublisher?.value),
    scoreCreator: parseFloatZeroed(x.scoreCreator?.value),
  };
};
type ScoreKey = Exclude<keyof ReturnType<typeof parseScoreRow>, "cubeIri">;
const weights: Record<ScoreKey, number> = {
  scoreName: 5,
  scoreDescription: 2,
  scoreTheme: 1,
  scorePublisher: 1,
  scoreCreator: 1,
};
/**
 * From a list of scores where each row contains only one score,
 * computes an index from cubeIri to weighted score.
 */

export const computeScores = (
  scoresRaw: any[],
  { keepZeros }: { keepZeros: boolean }
) => {
  const scores = scoresRaw.map((r) => parseScoreRow(r));

  const infoPerCube = scores.reduce(
    (acc, scoreRow) => {
      let cubeScore = acc[scoreRow.cubeIri]?.score ?? 0;
      for (let [key, weight] of Object.entries(weights)) {
        const attrScore = scoreRow[key as ScoreKey] ?? 0;
        if (attrScore > 0) {
          cubeScore = cubeScore + scoreRow[key as ScoreKey] * weight;
        }
      }
      if (cubeScore > 0 || keepZeros) {
        acc[scoreRow.cubeIri] = acc[scoreRow.cubeIri] || {
          score: 0,
        };
        acc[scoreRow.cubeIri].score = cubeScore;
      }
      return acc;
    },
    {} as Record<
      string,
      {
        score: number;
        highlights: Record<ScoreKey, string>;
      }
    >
  );

  return infoPerCube;
};
