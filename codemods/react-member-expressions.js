module.exports = function (file, api) {
  /**
   * @type import("jscodeshift")
   */
  const j = api.jscodeshift;

  const root = j(file.source);
  // Find all member expressions starting with 'React.'
  const reactMemberExpressions = root
    .find(j.MemberExpression, {
      object: {
        name: "React",
      },
    })
    .filter((path) =>
      // Filter only the properties you're interested in
      [
        "useMemo",
        "useState",
        "useContext",
        "useEffect",
        "createContext",
        "useReducer",
        "memo",
        "forwardRef",
        "useRef",
        "useCallback",
        "useImperativeHandle",
        "createElement",
      ].includes(path.node.property.name)
    );

  const namedImports = new Set();
  reactMemberExpressions.forEach((path) => {
    namedImports.add(path.value.property.name);
  });

  reactMemberExpressions.forEach((path) => {
    path.replace(j.identifier(path.value.property.name));
  });

  // Add imports for named members if they don't exist
  const reactImportDeclaration = root.find(j.ImportDeclaration, {
    source: {
      value: "react",
    },
  });

  if (namedImports.size > 0) {
    if (reactImportDeclaration.size() === 0) {
      root
        .find(j.ImportDeclaration)
        .at(0)
        .insertBefore(
          `import { ${Array.from(namedImports).join(", ")} } from 'react`
        );
    } else {
      // If React import exists, add missing named imports
      //   console.log(reactImportDeclaration.get());
      const reactImportNode = reactImportDeclaration.get().node;
      const existingSpecifiers = new Set();

      reactImportNode.specifiers.forEach((path) => {
        existingSpecifiers.add(path.local.name);
      });
      const missingSpecifiers = Array.from(namedImports).filter(
        (name) => !existingSpecifiers.has(name)
      );

      if (missingSpecifiers.length > 0) {
        reactImportNode.specifiers.push(
          ...missingSpecifiers.map((name) =>
            j.importSpecifier(j.identifier(name), j.identifier(name))
          )
        );
      }
    }
  }

  return root.toSource();
};
