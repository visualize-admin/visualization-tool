const pathLib = require("path");

// jscodeshift can take a parser, like "babel", "babylon", "flow", "ts", or "tsx"
// Read more: https://github.com/facebook/jscodeshift#parser
export const parser = "tsx";

const cwd = process.cwd();

export default function transformer(file, api) {
  /**
   * @type import("jscodeshift")
   */
  const j = api.jscodeshift;

  const filepath = file.path;
  const dir = pathLib.dirname(filepath);

  return j(file.source)
    .find(j.ImportDeclaration)
    .forEach((path) => {
      const node = path.node;
      if (
        node.source.value.startsWith("lodash") &&
        !node.source.value.startsWith("lodash/")
      ) {
        const specifiers = node.specifiers;
        for (const specifier of specifiers) {
          const decl = j.importDeclaration(
            [j.importDefaultSpecifier(j.identifier(specifier.imported.name))],
            j.literal(`lodash/${specifier.imported.name}`)
          );
          path.insertBefore(decl);
        }
        path.prune();
      }
    })
    .toSource();
}
