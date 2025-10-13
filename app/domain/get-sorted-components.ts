import { ascending } from "d3-array";

import { Component } from "@/domain/data";

export const getSortedComponents = (components: Component[]) => {
  return [...components].sort((a, b) => {
    return ascending(a.order ?? Infinity, b.order ?? Infinity);
  });
};
