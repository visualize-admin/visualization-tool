import { DataCubeMetadataQuery } from "@/graphql/query-hooks";

const makeOpenDataLink = (
  lang: string,
  cube: DataCubeMetadataQuery["dataCubeByIri"]
) => {
  const identifier = cube?.identifier;
  const creatorIri = cube?.creator?.iri;
  const isPublished = cube?.workExamples?.includes(
    "https://ld.admin.ch/application/opendataswiss"
  );
  if (!identifier || !creatorIri || !isPublished) {
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
