import { DataCubeMetadata } from "@/domain/data";

export const makeOpenDataLink = (lang: string, cube: DataCubeMetadata) => {
  const identifier = cube?.identifier;
  const creatorIri = cube?.creator?.iri;
  const isPublished = cube?.workExamples?.includes(
    "https://ld.admin.ch/application/opendataswiss"
  );

  if (!identifier || !creatorIri || !isPublished) {
    return;
  }

  const creatorSlug = creatorIri.replace(
    "https://register.ld.admin.ch/opendataswiss/org/",
    ""
  );

  return `https://opendata.swiss/${lang}/perma/${encodeURIComponent(
    // Sometimes the identifier is prefixed with the creator slug
    `${identifier.replace(`@${creatorSlug}`, "")}@${creatorSlug}`
  )}`;
};
