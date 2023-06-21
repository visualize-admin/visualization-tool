import { DataSource } from "@/config-types";
import { dataSourceToSparqlEditorUrl } from "@/domain/datasource";

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
