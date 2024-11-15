import { getTextWidth } from "./get-text-width";

const WORD_SPLITTING_THRESHOLD = 0.75;

export const splitTextByWidth = (
  text: string,
  width: number,
  options: { fontSize: number }
): string => {
  const { fontSize } = options;
  const words = text.split(" ");
  let currentLine = "";
  const lines: string[] = [];

  words.forEach((word) => {
    const wordWidth = getTextWidth(word, { fontSize });

    if (wordWidth > width * WORD_SPLITTING_THRESHOLD) {
      let partialWord = "";
      for (const char of word) {
        if (getTextWidth(partialWord + char, { fontSize }) > width) {
          lines.push(partialWord + "-");
          partialWord = char;
        } else {
          partialWord += char;
        }
      }
      if (partialWord) {
        lines.push(partialWord);
      }
    } else {
      if (getTextWidth(currentLine + " " + word, { fontSize }) > width) {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += " " + word;
      }
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines.join("\n");
};
