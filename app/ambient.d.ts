declare module "@rebass/preset" {
  const theme: any;
  export default theme;
}

declare module "@rebass/forms" {
  export const Label: (props: any) => JSX.Element;
  export const Input: (props: any) => JSX.Element;
  export const Select: (props: any) => JSX.Element;
  export const Radio: (props: any) => JSX.Element;
  export const Checkbox: (props: any) => JSX.Element;
  export const Textarea: (props: any) => JSX.Element;
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
