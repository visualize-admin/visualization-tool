import { DatasetMetadata } from "@/components/dataset-metadata";
import { DataSource } from "@/config-types";
import { useDataCubeMetadataQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const DatasetMetadataSingleCube = ({
  dataSource,
  datasetIri,
}: {
  dataSource: DataSource;
  datasetIri: string;
}) => {
  const locale = useLocale();
  const [data] = useDataCubeMetadataQuery({
    variables: {
      cubeFilter: { iri: datasetIri },
      locale: locale,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
    },
  });

  if (!data.data) {
    return null;
  }

  return (
    <DatasetMetadata
      cube={data.data.dataCubeMetadata}
      showTitle={false}
      dataSource={dataSource}
    />
  );
};
