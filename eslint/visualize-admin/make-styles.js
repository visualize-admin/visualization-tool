const ignoredProperties = new Set([
  "margin",
  "padding",
  "m",
  "p",
  "ml",
  "mr",
  "mt",
  "mb",
  "pl",
  "pr",
  "pt",
  "pb",
]);

const isThemeColor = (str) => {
  if (!str.includes) {
    return false;
  } else {
    return (
      str.includes("grey") ||
      str.includes("primary") ||
      str.includes("secondary") ||
      str.includes("muted") ||
      str.includes("hint") ||
      str.includes("action") ||
      str.includes("brand")
    );
  }
};

const isShorthandProperty = (prop) => {
  if (
    prop.key &&
    (prop.key.name === "p" ||
      prop.key.name === "px" ||
      prop.key.name === "py" ||
      prop.key.name === "pt" ||
      prop.key.name === "pr" ||
      prop.key.name === "pb" ||
      prop.key.name === "pl" ||
      prop.key.name === "m" ||
      prop.key.name === "mx" ||
      prop.key.name === "my" ||
      prop.key.name === "mt" ||
      prop.key.name === "mr" ||
      prop.key.name === "mb" ||
      prop.key.name === "ml")
  ) {
    return true;
  }
  return false;
};

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  create(context) {
    return {
      'CallExpression[callee.name="makeStyles"]': function (node) {
        // Handle makeStyles({}) and makeStyles(theme => ({}))
        const classNames =
          node.arguments[0] && node.arguments[0].type === "ObjectExpression"
            ? node.arguments[0]
            : node.arguments[0].body;
        if (
          !classNames ||
          !classNames.properties ||
          !classNames.properties.length
        ) {
          return;
        }

        const checkProperty = (property) => {
          if (isShorthandProperty(property)) {
            context.report({
              node: property,
              message:
                "Cannot use shorthand properties in makeStyles, please use full property",
            });
          }
          if (property.key && property.key.name === "typography") {
            context.report({
              node: property,
              message:
                'Cannot use "typography" property in makeStyles, please use sx for this',
            });
          }

          if (
            property.key &&
            (property.key.name === "padding" ||
              property.key.name === "margin" ||
              isShorthandProperty(property)) &&
            property.value.type === "Literal" &&
            typeof property.value.value === "number" &&
            property.value.value !== 0
          ) {
            context.report({
              node: property,
              message:
                "Careful with number inside padding in margin, prefer to use either a string or theme.spacing",
            });
          }

          if (
            property.key &&
            property.key.name === "boxShadow" &&
            property.value.type === "Literal" &&
            typeof property.value.value === "string" &&
            property.value.value !== "none"
          ) {
            context.report({
              node: property,
              message: `Please use theme.shadows instead of ${property.value.value}`,
            });
          }

          if (
            property.value &&
            property.value.type === "Literal" &&
            isThemeColor(property.value.value)
          ) {
            context.report({
              node: property,
              message:
                "Literal theme colors do not work in makeStyles, please use theme.palette to access colors from the palette",
            });
          }
        };
        const items = [...classNames.properties];
        while (items.length > 0) {
          const item = items.shift();
          if (
            !item.value ||
            !item.value.properties ||
            !item.value.properties.length
          ) {
            continue;
          }
          for (let property of item.value.properties) {
            if (property.value && property.value.type === "ObjectExpression") {
              items.push(property);
              if (
                property.key &&
                property.key.value &&
                property.key.value.startsWith(":")
              ) {
                context.report({
                  node: property,
                  message: 'Cannot use only ":" Must use &: in makeStyles',
                });
              }
            } else {
              checkProperty(property);
            }
          }
        }
      },
    };
  },
};
