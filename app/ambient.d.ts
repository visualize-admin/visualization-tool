// -----------------------------------------------------------------------------
// TypeScript helpers

/** Fix this type, preferably before accepting the PR */
type $FixMe = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** This `any` is intentional => never has to be fixed */
type $IntentionalAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** TS cannot express the proper type atm */
type $Unexpressable = any; // eslint-disable-line @typescript-eslint/no-explicit-any

// -----------------------------------------------------------------------------
// MDX stuff

declare module "*.mdx" {
  let MDXComponent: () => JSX.Element;
  export default MDXComponent;
}

declare module "@mdx-js/react" {
  interface MDXProps {
    children: React.ReactNode;
    components: Record<string, React.ComponentType<$IntentionalAny>>;
  }
  export class MDXProvider extends React.Component<MDXProps> {}
}

// GraphQL
declare module '*.graphql' {
  import { DocumentNode } from 'graphql'
  const Schema: DocumentNode

  export = Schema
}
