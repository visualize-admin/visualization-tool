/**
 * Rollup config to compile /embed/index.tsx
 */

import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import json from "@rollup/plugin-json";
import babel from "rollup-plugin-babel";
import builtins from "rollup-plugin-node-builtins";
import { terser } from "rollup-plugin-terser";

const extensions = [".js", ".jsx", ".ts", ".tsx"];

export default {
  input: "embed/index.tsx",
  extensions,
  output: {
    intro: "var global = typeof self !== undefined ? self : this;",
    file: "app/public/dist/embed.js",
    format: "iife",
    name: "VisualizeEmbed",
  },
  plugins: [
    replace({ "process.env.NODE_ENV": JSON.stringify("production") }),
    resolve({
      mainFields: ["browser", "module", "main"],
      preferBuiltins: true,
      extensions,
    }),
    builtins(),
    commonjs({
      namedExports: {
        react: [
          "createElement",
          "forwardRef",
          "useState",
          "useMemo",
          "useEffect",
          "useLayoutEffect",
          "useContext",
          "useCallback",
          "useReducer",
          "useRef",
          "createContext",
          "Component",
          "memo",
        ],
        "next/router": ["useRouter"],
        "@rdfjs/data-model": [
          "namedNode",
          "literal",
          "variable",
          "blankNode",
          "defaultGraph",
        ],
        sparqljs: ["Generator"],
        "@lingui/react": ["Trans"],
      },
    }),
    json(),
    babel({
      extensions,
      include: ["embed/**/*", "app/**/*"],
      exclude: "node_modules/**",
      configFile: "./babel.config.js",
      runtimeHelpers: true,
    }),
    terser(),
  ],
};
