import { Annotation, HighlightAnnotation } from "@/config-types";
import { createId } from "@/utils/create-id";

const ANNOTATION_FIELD_PREFIX = "annotation";

const getAnnotationKey = (type: Annotation["type"]) => {
  const key = createId();

  return `${ANNOTATION_FIELD_PREFIX}:${type}:${key}`;
};

export const isAnnotationField = (field: string | undefined) => {
  return !!field?.startsWith(ANNOTATION_FIELD_PREFIX);
};

export const getDefaultHighlightAnnotation = (): HighlightAnnotation => {
  return {
    key: getAnnotationKey("highlight"),
    type: "highlight",
    targets: [],
    text: {
      de: "",
      fr: "",
      it: "",
      en: "",
    },
    highlightType: "none",
    color: undefined,
    defaultOpen: true,
  };
};
