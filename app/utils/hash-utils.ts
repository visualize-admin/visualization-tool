type Object = Record<string, any>;

const KEY_SEPARATOR = "__SEP__";
const VALUE_SEPARATOR = "=";
const JOIN_SEPARATOR = "||";
const NUMBER_PREFIX = "__NUM__";
const NEWLINE_REPLACEMENT = "__NL__";

/** Converts an object into a URL-friendly hash string. */
export const objectToHashString = (o: Object) => {
  return `#${objectToKeyValuePairs(o).join(JOIN_SEPARATOR)}`;
};

/** Converts a URL-friendly hash string back into the original object. */
export const hashStringToObject = (hashString: string) => {
  return keyValuePairsToObject(
    decodeURIComponent(hashString.slice(1)).split(JOIN_SEPARATOR)
  );
};

const objectToKeyValuePairs = (o: Object) => {
  const flatObject = flattenObject(o);
  return Object.entries(flatObject).map(([k, v]) => {
    return `${k}${VALUE_SEPARATOR}${v}`;
  });
};

const keyValuePairsToObject = (keyValuePairs: string[]) => {
  const o: Object = {};
  keyValuePairs.forEach((kv) => {
    // Make sure we allow equal signs in the value - the first one is the actual separator.
    const firstEqualIndex = kv.indexOf(VALUE_SEPARATOR);

    if (firstEqualIndex === -1) {
      return;
    }

    const k = kv.slice(0, firstEqualIndex);
    const v = kv.slice(firstEqualIndex + 1);
    o[k] = v;
  });

  return unflattenObject(o);
};

const flattenObject = (o: Object, parentKey = "", result: Object = {}) => {
  if (
    typeof o === "object" &&
    o !== null &&
    !Array.isArray(o) &&
    Object.keys(o).length === 0
  ) {
    result[parentKey] = "{}";

    return result;
  }

  for (const k in o) {
    if (o.hasOwnProperty(k)) {
      const newKey = parentKey ? `${parentKey}${KEY_SEPARATOR}${k}` : k;
      const v = o[k];

      if (typeof v === "object" && v !== null && !Array.isArray(v)) {
        if (Object.keys(v).length === 0) {
          result[newKey] = "{}";
        } else {
          flattenObject(v, newKey, result);
        }
      } else if (Array.isArray(v)) {
        if (v.length === 0) {
          result[newKey] = "[]";
        } else {
          v.forEach((item, index) => {
            const arrayKey = `${newKey}${KEY_SEPARATOR}${index}`;
            if (typeof item === "object" && item !== null) {
              flattenObject(item, arrayKey, result);
            } else {
              result[arrayKey] =
                typeof item === "string"
                  ? item.replace(/\n/g, NEWLINE_REPLACEMENT)
                  : `${item}`;
            }
          });
        }
      } else {
        result[newKey] =
          typeof v === "number"
            ? `${NUMBER_PREFIX}${v}`
            : typeof v === "string"
              ? v.replace(/\n/g, NEWLINE_REPLACEMENT)
              : `${v}`;
      }
    }
  }
  return result;
};

const parseValue = (v: any) => {
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null") return null;
  if (v === "undefined") return undefined;
  if (v === "[]") return [];
  if (v === "{}") return {};
  if (typeof v === "string" && v.startsWith(NUMBER_PREFIX)) {
    const num = v.slice(NUMBER_PREFIX.length);

    if (num !== "" && !isNaN(+num)) {
      return +num;
    }
  }

  if (typeof v === "string") {
    return v.replace(new RegExp(NEWLINE_REPLACEMENT, "g"), "\n");
  }

  return v;
};

const unflattenObject = (o: Object) => {
  const result: Object = {};

  for (const rootKey in o) {
    if (o.hasOwnProperty(rootKey)) {
      const keys = rootKey.split(KEY_SEPARATOR);
      keys.reduce((acc, k, i) => {
        if (i === keys.length - 1) {
          acc[k] = o[rootKey];
        } else {
          if (!(k in acc)) {
            acc[k] = {};
          }

          return acc[k];
        }

        return acc;
      }, result);
    }
  }

  const transformArraysAndScalars = (obj: any) => {
    if (typeof obj !== "object" || obj === null) {
      return parseValue(obj);
    }

    for (const k in obj) {
      if (obj.hasOwnProperty(k)) {
        obj[k] = transformArraysAndScalars(obj[k]);
      }
    }

    const keys = Object.keys(obj);

    if (keys.length > 0 && keys.every((k) => !isNaN(Number(k)))) {
      const sortedKeys = keys.sort((a, b) => Number(a) - Number(b));
      const arr = sortedKeys.map((numKey) => obj[numKey]);

      return arr;
    }

    return obj;
  };

  return transformArraysAndScalars(result);
};
