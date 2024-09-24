import { SearchCubeFilter, useSearchPageQuery } from "@/graphql/query-hooks";
import { useConfiguratorState, useLocale } from "@/src";

export const useSearchPageData = ({
  includeDrafts,
  filters,
}: {
  includeDrafts: boolean;
  filters: SearchCubeFilter[];
}) => {
  const locale = useLocale();
  const [configState] = useConfiguratorState();
  const { dataSource } = configState;
  const [searchPageQuery] = useSearchPageQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      includeDrafts,
      filters,
      locale,
    },
  });
  return searchPageQuery;
};
