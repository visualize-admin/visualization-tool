const SAFE_IRI = /^https?:\/\/[^ <>"{}|\\^`]+$/;

export const isSafeIri = (iri: string): boolean => {
  return SAFE_IRI.test(iri);
};

export const chunk = <T>(items: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size)
  );
};

export const IRIS_CHUNK_SIZE = 100;
