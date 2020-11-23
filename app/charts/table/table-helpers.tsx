import { useLayoutEffect } from "react";

let _scrollbarWidth: number | undefined = undefined;
export const scrollbarWidth = (): number => {
  if (_scrollbarWidth !== undefined) {
    return _scrollbarWidth;
  }
  // thanks too https://davidwalsh.name/detect-scrollbar-width
  const scrollDiv = document.createElement("div");
  scrollDiv.setAttribute(
    "style",
    "width: 100px; height: 100px; overflow: scroll; position:absolute; top:-9999px;"
  );
  document.body.appendChild(scrollDiv);
  _scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return _scrollbarWidth;
};

const SlugRe = /\W+/g;
export const getSlugifiedIri = (iri: string) => iri.replace(SlugRe, "_");
