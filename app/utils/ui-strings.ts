import { ReactNode } from "react";
import reactStringReplace from "react-string-replace";

export const replaceLinks = (
  str: string,
  replacer: (label: string, link: string) => ReactNode
) => {
  return reactStringReplace(str, /(\[.*\]\(.*\))/, (match) => {
    const splitIndex = match.indexOf("](");
    const label = match.slice(1, splitIndex);
    const link = match.slice(splitIndex + 2, match.length - 1);
    return replacer(label, link);
  });
};
