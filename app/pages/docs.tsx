/* eslint-disable import/no-anonymous-default-export */
import { MDXProvider } from "@mdx-js/react";
import { CssBaseline } from "@mui/material";
import {
  AudioSpecimen,
  Catalog,
  CodeSpecimen,
  ColorPaletteSpecimen,
  ColorSpecimen,
  ConfigPageOrGroup,
  DownloadSpecimen,
  HintSpecimen,
  HtmlSpecimen,
  ImageSpecimen,
  Markdown,
  Page,
  TableSpecimen,
  TypeSpecimen,
} from "catalog";
import { useEffect, useState } from "react";
import { i18n, I18nProvider, parseLocaleString } from "../src";

const pages: ConfigPageOrGroup[] = [
  { path: "/", title: "Introduction", content: require("../docs/index.mdx") },
  {
    path: "/branding",
    title: "Branding",
    content: require("../docs/branding.mdx"),
  },
  {
    path: "/accessibility",
    title: "Accessibility",
    content: require("../docs/accessibility.mdx"),
  },
  {
    title: "Theming",
    pages: [
      {
        path: "/theming",
        title: "Overview",
        content: require("../docs/theming.mdx"),
      },
      {
        path: "/colors",
        title: "Colors",
        content: require("../docs/colors.mdx"),
      },
      {
        path: "/typography",
        title: "Typography",
        content: require("../docs/typography.mdx"),
      },
      {
        path: "/iconography",
        title: "Iconography",
        content: require("../docs/icons.docs.tsx"),
      },
      {
        path: "/layout",
        title: "Layout",
        content: require("../docs/layout.mdx"),
      },
    ],
  },
  {
    title: "Design Concept",
    pages: [
      {
        path: "/mockups",
        title: "Mockups",
        content: require("../docs/mockups"),
      },
      {
        path: "/chart-config",
        title: "Chart-Config",
        content: require("../docs/chart-config"),
      },
    ],
  },
  {
    title: "Charts",
    pages: [
      {
        path: "/charts/types",
        title: "Types",
        content: require("../docs/chart-types.mdx"),
      },
      {
        path: "/charts/annotations",
        title: "Annotations",
        content: require("../docs/annotations.docs"),
      },
      {
        path: "/charts/columns-chart",
        title: "Columns",
        content: require("../docs/columns.docs"),
      },
      {
        path: "/charts/line-chart",
        title: "Lines",
        content: require("../docs/lines.docs"),
      },
      {
        path: "/charts/scatterplot",
        title: "Scatterplot",
        content: require("../docs/scatterplot.docs"),
      },
      {
        path: "/charts/data-table",
        title: "Table",
        content: require("../docs/data-table.docs"),
      },
      {
        path: "/charts/cube-update",
        title: "Cube update",
        content: require("../docs/cube-update-constraints.mdx"),
      },
    ],
  },
  {
    title: "Components",
    pages: [
      {
        path: "/components/intro",
        title: "Introduction",
        content: require("../docs/components"),
      },
      {
        path: "/components/button",
        title: "Button",
        content: require("../docs/button.docs"),
      },
      {
        path: "/components/color-ramp",
        title: "Color Ramp",
        content: require("../docs/color-ramp.docs"),
      },
      {
        path: "/components/controls",
        title: "Controls",
        content: require("../docs/controls.docs"),
      },
      {
        path: "/components/dataset-browse",
        title: "Datasets Browsing",
        content: require("../docs/dataset-browse.docs"),
      },
      {
        path: "/components/footer",
        title: "Footer",
        content: require("../docs/footer.docs"),
      },
      {
        path: "/components/form",
        title: "Form",
        content: require("../docs/form.docs"),
      },
      {
        path: "/components/header",
        title: "Header",
        content: require("../docs/header.docs"),
      },
      {
        path: "/components/hints",
        title: "Hints",
        content: require("../docs/hint.docs"),
      },
      {
        path: "/components/homepage",
        title: "Homepage",
        content: require("../docs/homepage.docs"),
      },
      {
        path: "/components/publish-actions",
        title: "Publish actions",
        content: require("../docs/publish-actions.docs"),
      },

      {
        path: "/components/steps",
        title: "Stepper",
        content: require("../docs/steps.docs"),
      },
      {
        path: "/components/table",
        title: "Preview Table",
        content: require("../docs/table.docs"),
      },
      {
        path: "/components/tags",
        title: "Tags",
        content: require("../docs/tags.docs"),
      },
      {
        path: "/components/typography",
        title: "Typography",
        content: require("../docs/text.docs"),
      },
    ],
  },
  {
    path: "/testing",
    title: "Testing",
    content: require("../docs/testing.mdx"),
  },
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
  DownloadSpecimen,
};

export default () => {
  const [mounted, setMounted] = useState(false);
  const locale = parseLocaleString("en");
  i18n.activate(locale);
  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? (
    <MDXProvider components={mdxComponents}>
      <I18nProvider i18n={i18n}>
        <CssBaseline />
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
            pageHeadingBackground: "#156896",
          }}
        />
      </I18nProvider>
    </MDXProvider>
  ) : null;
};
