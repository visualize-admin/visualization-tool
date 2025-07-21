import { DataSource } from "@/config-types";
import { dataSourceToSparqlEditorUrl } from "@/domain/data-source";

export const getSparqlEditorUrl = ({
  query,
  dataSource,
}: {
  query: string;
  dataSource: DataSource;
}): string => {
  const editorUrl = dataSourceToSparqlEditorUrl(dataSource);
  return `${editorUrl}#query=${encodeURIComponent(query)}&requestMethod=POST`;
};
