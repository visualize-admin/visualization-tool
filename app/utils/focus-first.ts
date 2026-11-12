export const focusFirst = (node: HTMLElement, selector: string) => {
  node.querySelector<HTMLElement>(selector)?.focus();
};
