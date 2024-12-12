import { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";

const components: ComponentProps<typeof ReactMarkdown>["components"] = {};

export const Markdown = (
  props: Omit<ComponentProps<typeof ReactMarkdown>, "components">
) => {
  return <ReactMarkdown components={components} {...props} />;
};
