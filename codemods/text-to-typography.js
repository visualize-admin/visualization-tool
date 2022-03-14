export const parser = 'tsx'

// Press ctrl+space for code completion

export default function transformer(file, api) {
  const j = api.jscodeshift;

  return j(file.source)
    .find(j.ImportSpecifier, { imported: {name: "Text"} })
    .forEach(path => {
		path.node.imported.name = 'Typography'
    })
    .toSource();
}
