import { useSearchPageQuery } from "@/graphql/query-hooks";
import { useConfiguratorState, useLocale } from "@/src";

export const useSearchPageData = () => {
  const locale = useLocale();
  const [configState] = useConfiguratorState();
  const { dataSource } = configState;
  const [searchPageQuery] = useSearchPageQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  return searchPageQuery;
};
