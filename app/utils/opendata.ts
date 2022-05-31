import {
  DataCubeMetadataWithComponentValuesQuery,
  DataCubeMetadataQuery,
} from "@/graphql/query-hooks";

const makeOpenDataLink = (
  lang: string,
  cube:
    | DataCubeMetadataWithComponentValuesQuery["dataCubeByIri"]
    | DataCubeMetadataQuery["dataCubeByIri"]
) => {
  const identifier = cube?.identifier;
  const creatorIri = cube?.creator?.iri;
  if (!identifier || !creatorIri) {
    return;
  }
  return `https://opendata.swiss/${lang}/perma/${encodeURIComponent(
    `${identifier}@${creatorIri.replace(
      "https://register.ld.admin.ch/opendataswiss/org/",
      ""
    )}`
  )}`;
};

export { makeOpenDataLink };
