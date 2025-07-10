import { Annotation, HighlightAnnotation } from "@/config-types";

const ANNOTATION_FIELD_PREFIX = "annotation:";

const getAnnotationKey = (type: Annotation["type"]) => {
  return `${ANNOTATION_FIELD_PREFIX}${type}`;
};

export const isAnnotationField = (field: string | undefined) => {
  return field?.startsWith(ANNOTATION_FIELD_PREFIX);
};

export const getDefaultHighlightAnnotation = (): HighlightAnnotation => {
  return {
    key: getAnnotationKey("highlight"),
    type: "highlight",
    target: {
      axis: undefined,
      segment: undefined,
    },
    text: {
      de: "",
      fr: "",
      it: "",
      en: "",
    },
    highlightType: "none",
    color: undefined,
  };
};
