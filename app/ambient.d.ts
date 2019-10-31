// -----------------------------------------------------------------------------
// TypeScript helpers

/** Fix this type, preferably before accepting the PR */
type $FixMe = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** This `any` is intentional => never has to be fixed */
type $IntentionalAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** TS cannot express the proper type atm */
type $Unexpressable = any; // eslint-disable-line @typescript-eslint/no-explicit-any

declare module "@rebass/preset" {
  const theme: $IntentionalAny;
  export default theme;
}

declare module "@rebass/forms" {
  export const Label: (props: $IntentionalAny) => JSX.Element;
  export const Input: (props: $IntentionalAny) => JSX.Element;
  export const Select: (props: $IntentionalAny) => JSX.Element;
  export const Radio: (props: $IntentionalAny) => JSX.Element;
  export const Checkbox: (props: $IntentionalAny) => JSX.Element;
  export const Textarea: (props: $IntentionalAny) => JSX.Element;
}

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
