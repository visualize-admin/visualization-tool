// jscodeshift can take a parser, like "babel", "babylon", "flow", "ts", or "tsx"
// Read more: https://github.com/facebook/jscodeshift#parser
export const parser = "tsx";

const replacements = {
  primary: {
    color: "primary",
    variant: "contained",
  },
  "primary-small": {
    color: "primary",
    variant: "contained",
    size: "small",
  },
  secondary: {
    color: "secondary",
    variant: "contained",
  },
  "secondary-small": {
    color: "secondary",
    variant: "contained",
    size: "small",
  },
  success: {
    color: "success",
    variant: "contained",
  },
  reset: {
    variant: "reset",
  },
  inline: {
    variant: "text",
  },
  "inline-bold": {
    variant: "text",
  },
  small: {
    variant: "contained",
    color: "primary",
    size: "small",
  },
};

export default function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.JSXOpeningElement, { name: { name: "Button" } })
    .forEach((path) => {
      const node = path.node;
      const variant = node.attributes.find(
        (x) => x.name && x.name.name === "variant"
      );
      if (!variant) {
        return;
      }
      const repl = replacements[variant.value.value];
      if (!repl) {
        return;
      }
      const extra = [];
      const attrsByName = node.attributes.reduce((acc, attr) => {
        if (attr.name) {
          acc[attr.name.name] = attr;
        } else {
          extra.push(attr);
        }
        return acc;
      }, {});
      for (let attrName of Object.keys(repl)) {
        attrsByName[attrName] = j.jsxAttribute(
          j.jsxIdentifier(attrName),
          j.literal(repl[attrName])
        );
      }
      node.attributes = Object.values(attrsByName).concat(extra);
    })
    .toSource();
}
