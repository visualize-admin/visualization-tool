// jscodeshift can take a parser, like "babel", "babylon", "flow", "ts", or "tsx"
// Read more: https://github.com/facebook/jscodeshift#parser
export const parser = "tsx";

// Press ctrl+space for code completion

const themeUIFontSizes = [
  "0rem",
  "0.625rem",
  "0.75rem",
  "0.875rem",
  "1rem",
  "1.125rem",
  "1.5rem",
  "2rem",
  "2.5rem",
  "3rem",
  "4.5rem",
  "5.5rem",
];
export default function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.JSXAttribute, {
      name: { name: "sx" },
      value: { expression: { type: "ObjectExpression" } },
    })
    .forEach((path) => {
      const node = path.node;
      for (let prop of node.value.expression.properties) {
        if (prop.key && prop.key.name === "fontSize") {
          const value = prop.value;
          if (value.type === "ArrayExpression") {
            for (let e of value.elements) {
              if (typeof e.value !== "number") {
                continue;
              }
              e.value = `"${themeUIFontSizes[e.value]}"`;
            }
          } else if (value.type === "NumericLiteral") {
            prop.value = `"${themeUIFontSizes[value.value]}"`;
          }
        }
      }
    })
    .toSource();
}
