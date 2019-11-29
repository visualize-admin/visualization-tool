import {
  Catalog,
  ConfigPageOrGroup,
  ImageSpecimen,
  AudioSpecimen,
  CodeSpecimen,
  ColorSpecimen,
  ColorPaletteSpecimen,
  HtmlSpecimen,
  HintSpecimen,
  TableSpecimen,
  TypeSpecimen,
  DownloadSpecimen,
  Page,
  Markdown
} from "catalog";
import { MDXProvider } from "@mdx-js/react";
import { useEffect, useState } from "react";

const pages: ConfigPageOrGroup[] = [
  { path: "/", title: "Introduction", content: require("../docs/index.mdx") },
  {
    path: "/branding",
    title: "Branding",
    content: require("../docs/branding.mdx")
  },
  {
    path: "/accessibility",
    title: "Accessibility",
    content: require("../docs/accessibility.mdx")
  },
  {
    title: "Theming",
    pages: [
      {
        path: "/theming",
        title: "Overview",
        content: require("../docs/theming.mdx")
      },
      {
        path: "/colors",
        title: "Colors",
        content: require("../docs/colors.mdx")
      },
      {
        path: "/typography",
        title: "Typography",
        content: require("../docs/typography.mdx")
      },
      {
        path: "/iconography",
        title: "Iconography",
        content: require("../docs/icons.docs.tsx")
      },
      {
        path: "/layout",
        title: "Layout",
        content: require("../docs/layout.mdx")
      }
    ]
  },
  {
    title: "Design Concept",
    pages: [
      {
        path: "/mockups",
        title: "Mockups",
        content: require("../docs/mockups")
      },
      {
        path: "/chart-config",
        title: "Chart-Config",
        content: require("../docs/chart-config")
      }
    ]
  },
  {
    title: "Components",
    pages: [
      {
        path: "/components/intro",
        title: "Introduction",
        content: require("../docs/components")
      },
      {
        path: "/components/action-bar",
        title: "Action Bar",
        content: require("../docs/action-bar.docs")
      },
      {
        path: "/components/button",
        title: "Button",
        content: require("../docs/button.docs")
      },
      {
        path: "/components/controls",
        title: "Controls",
        content: require("../docs/controls.docs")
      },
      {
        path: "/components/dataset-list",
        title: "Datasets List",
        content: require("../docs/dataset-list.docs")
      },
      {
        path: "/components/form",
        title: "Form",
        content: require("../docs/form.docs")
      },
      {
        path: "/components/header",
        title: "Header",
        content: require("../docs/header.docs")
      },
      {
        path: "/components/hints",
        title: "Hints",
        content: require("../docs/hint.docs")
      },
      {
        path: "/components/publish-actions",
        title: "Publish actions",
        content: require("../docs/publish-actions.docs")
      },
      {
        path: "/components/steps",
        title: "Stepper",
        content: require("../docs/steps.docs")
      },
      {
        path: "/components/text",
        title: "Text",
        content: require("../docs/text.docs")
      }
    ]
  }
];

const mdxComponents = {
  wrapper: ({ children }: $IntentionalAny) => <Page>{children}</Page>,
  h1: (props: $IntentionalAny) => (
    <Markdown.Heading level={1} text={[props.children]} slug={"wat"} />
  ),
  h2: (props: $IntentionalAny) => (
    <Markdown.Heading level={2} text={[props.children]} slug={"wat"} />
  ),
  h3: (props: $IntentionalAny) => (
    <Markdown.Heading level={3} text={[props.children]} slug={"wat"} />
  ),
  h4: (props: $IntentionalAny) => (
    <Markdown.Heading level={4} text={[props.children]} slug={"wat"} />
  ),
  h5: (props: $IntentionalAny) => (
    <Markdown.Heading level={5} text={[props.children]} slug={"wat"} />
  ),
  h6: (props: $IntentionalAny) => (
    <Markdown.Heading level={6} text={[props.children]} slug={"wat"} />
  ),
  p: Markdown.Paragraph,
  ul: Markdown.UnorderedList,
  ol: Markdown.OrderedList,
  li: Markdown.ListItem,
  blockquote: Markdown.BlockQuote,
  em: Markdown.Em,
  strong: Markdown.Strong,
  del: Markdown.Del,
  img: Markdown.Image,
  code: Markdown.CodeSpan,
  hr: Markdown.Hr,
  a: ({ href, ...props }: $IntentionalAny) => (
    <Markdown.Link to={href} {...props} />
  ),
  ImageSpecimen,
  AudioSpecimen,
  CodeSpecimen,
  ColorSpecimen,
  ColorPaletteSpecimen,
  HtmlSpecimen,
  HintSpecimen,
  TableSpecimen,
  TypeSpecimen,
  DownloadSpecimen
};

export default () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <MDXProvider components={mdxComponents}>
      <Catalog
        title="Visualization Tool"
        pages={pages}
        theme={{
          brandColor: "#333",
          sidebarColorText: "#333",
          navBarTextColor: "#333",
          sidebarColorHeading: "#333",
          pageHeadingTextColor: "#fff",
          linkColor: "rgb(255,95,85)",
          sidebarColorTextActive: "rgb(255,95,85)",
          background: "#F5F5F5",
          pageHeadingBackground: "#156896"
        }}
      />
    </MDXProvider>
  ) : null;
};
