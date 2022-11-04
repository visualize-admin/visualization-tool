const ignoredProperties = new Set([
  // margin
  "margin",
  "m",
  "mx",
  "my",
  "ml",
  "mr",
  "mt",
  "mb",
  // padding
  "padding",
  "p",
  "px",
  "py",
  "pl",
  "pr",
  "pt",
  "pb",
]);

const maxPropsForSx = 5;

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  create(context) {
    return {
      'JSXAttribute[name.name="sx"]': function (node) {
        const value = node.value;

        // Count of literal properties excluding ignored properties
        if (value && value.type === "JSXExpressionContainer") {
          const props =
            (value.expression.properties &&
              value.expression.properties.filter(
                (p) =>
                  p.key &&
                  p.key.name &&
                  !ignoredProperties.has(p.key.name) &&
                  p.value &&
                  p.value.type &&
                  p.value.type === "Literal"
              )) ||
            [];
          if (props.length > maxPropsForSx) {
            context.report({
              node,
              message: `Don't create sx rules with more than ${maxPropsForSx} properties (here: ${props.length} properties). Please extract to useStyles.`,
            });
          }
        }
      },
    };
  },
};
