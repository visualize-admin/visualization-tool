// jscodeshift can take a parser, like "babel", "babylon", "flow", "ts", or "tsx"
// Read more: https://github.com/facebook/jscodeshift#parser
export const parser = "tsx";

function extractQueryName(str) {
  const match = str.match(/query ([a-zA-Z]*)/);
  return match ? match[1] : null;
}

export default function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.CallExpression, {
      callee: { object: { name: "http" }, property: { name: "post" } },
    })
    .forEach((path) => {
      const queryName = extractQueryName(path.node.arguments[1].value);
      if (queryName) {
        path.node.arguments[2].properties.push(
          j.property(
            "init",
            j.literal("tags"),
            j.objectExpression([
              j.property(
                "init",
                j.literal("graphqlQuery"),
                j.literal(queryName)
              ),
            ])
          )
        );
      }
    })
    .toSource();
}
