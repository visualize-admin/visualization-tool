/**
 * Uses markdown syntax for bold
 *
 * @example
 * <Boldify>I am *bold*</Boldify>
 */
export const Boldify = ({ children }: { children: string }) => {
  if (typeof children === "string") {
    return (
      <>
        {children.split(/(\*.*?\*)/g).map((m) => {
          return m.startsWith("*") ? <strong>{m.slice(1, -1)}</strong> : m;
        })}
      </>
    );
  } else {
    return children;
  }
};
