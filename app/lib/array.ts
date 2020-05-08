export const sortByIndex = <T>(
  data: T[],
  order: string[],
  getX: (datum: T) => string,
  sortOrder: "asc" | "desc"
) => {
  data.sort((a, b) => {
    const A = getX(a);
    const B = getX(b);
    if (order.indexOf(A) > order.indexOf(B)) {
      return sortOrder === "asc" ? 1 : -1;
    } else {
      return sortOrder === "asc" ? -1 : 1;
    }
  });

  return data;
};
