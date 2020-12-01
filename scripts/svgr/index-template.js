const path = require("path");
function defaultIndexTemplate(filePaths) {
  const entries = filePaths.map((filePath) => {
    const basename = path.basename(filePath, path.extname(filePath));
    const exportName = basename.replace(/^Ic/, "");
    return [exportName, basename];
  });

  return `${entries
    .map(([n, path]) => `import { default as ${n} } from "./${path}";`)
    .join("\n")}
  
export const Icons = {
  ${entries
    .map(([n, path]) => `${n.charAt(0).toLowerCase() + n.slice(1)}: ${n},`)
    .join("\n  ")}
};

export type IconName = keyof typeof Icons;
  `;
}
module.exports = defaultIndexTemplate;
