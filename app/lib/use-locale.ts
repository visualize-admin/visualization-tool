import { useRouter } from "next/router";

export const useLocale = () => {
  const { query } = useRouter();

  if (!query.locale) {
    throw Error("No locale at current route :(");
  }

  return query.locale as string;
};
