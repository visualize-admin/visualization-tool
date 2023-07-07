export const sortByIndex = <T>({
  data,
  order,
  getCategory,
  sortingOrder,
}: {
  data: T[];
  order: string[];
  getCategory: (datum: T) => string;
  sortingOrder?: "asc" | "desc";
}) => {
  data.sort((a, b) => {
    const A = getCategory(a);
    const B = getCategory(b);
    if (order.indexOf(A) > order.indexOf(B)) {
      return sortingOrder === "asc" ? 1 : -1;
    } else {
      return sortingOrder === "asc" ? -1 : 1;
    }
  });

  return data;
};
