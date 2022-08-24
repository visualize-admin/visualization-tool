export const sortByIndex = <T>({
  data,
  order,
  getCategory,
  sortOrder,
}: {
  data: T[];
  order: string[];
  getCategory: (datum: T) => string;
  sortOrder?: "asc" | "desc";
}) => {
  data.sort((a, b) => {
    const A = getCategory(a);
    const B = getCategory(b);
    if (order.indexOf(A) > order.indexOf(B)) {
      return sortOrder === "asc" ? 1 : -1;
    } else {
      return sortOrder === "asc" ? -1 : 1;
    }
  });

  return data;
};
