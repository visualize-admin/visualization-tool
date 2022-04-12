const pathLib = require("path");

// jscodeshift can take a parser, like "babel", "babylon", "flow", "ts", or "tsx"
// Read more: https://github.com/facebook/jscodeshift#parser
export const parser = "tsx";

const cwd = process.cwd();

export default function transformer(file, api) {
  const j = api.jscodeshift;

  const filepath = file.path;
  const dir = pathLib.dirname(filepath);

  return j(file.source)
    .find(j.ImportDeclaration)
    .forEach((path) => {
      const node = path.node;
      if (!node.source.value.startsWith(".")) {
        return;
      }
      const joined = pathLib.join(dir, node.source.value);
      if (joined.startsWith("app/")) {
        node.source.value = joined.replace(/app\//, "@/");
      }
    })
    .toSource();
}
