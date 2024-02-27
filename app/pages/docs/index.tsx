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
import Slugger from "github-slugger";
import { useEffect, useMemo, useState } from "react";

import { i18n, I18nProvider, parseLocaleString } from "@/src";

const pages: ConfigPageOrGroup[] = [
  {
    path: "/",
    title: "Introduction",
    content: require("@/docs/index.mdx"),
  },
  {
    path: "/branding",
    title: "Branding",
    content: require("@/docs/branding.mdx"),
  },
  {
    path: "/accessibility",
    title: "Accessibility",
    content: require("@/docs/accessibility.mdx"),
  },
  {
    title: "Theming",
    pages: [
      {
        path: "/theming",
        title: "Overview",
        content: require("@/docs/theming.mdx"),
      },
      {
        path: "/colors",
        title: "Colors",
        content: require("@/docs/colors.mdx"),
      },
      {
        path: "/typography",
        title: "Typography",
        content: require("@/docs/typography.mdx"),
      },
      {
        path: "/iconography",
        title: "Iconography",
        content: require("@/docs/icons.docs.tsx"),
      },
      {
        path: "/layout",
        title: "Layout",
        content: require("@/docs/layout.mdx"),
      },
    ],
  },
  {
    title: "Design Concept",
    pages: [
      {
        path: "/mockups",
        title: "Mockups",
        content: require("@/docs/mockups"),
      },
      {
        path: "/chart-config",
        title: "Chart-Config",
        content: require("@/docs/chart-config"),
      },
    ],
  },
  {
    title: "Charts",
    pages: [
      {
        path: "/charts/rdf-to-visualize",
        title: "RDF to visualize",
        content: require("@/docs/rdf-to-visualize.mdx"),
      },
      {
        path: "/charts/preview-via-api",
        title: "Preview via API",
        content: require("@/docs/chart-preview-via-api.mdx"),
      },
      {
        path: "/charts/annotations",
        title: "Annotations",
        content: require("@/docs/annotations.docs"),
      },
      {
        path: "/charts/columns-chart",
        title: "Columns",
        content: require("@/docs/columns.docs"),
      },
      {
        path: "/charts/line-chart",
        title: "Lines",
        content: require("@/docs/lines.docs"),
      },
      {
        path: "/charts/scatterplot",
        title: "Scatterplot",
        content: require("@/docs/scatterplot.docs"),
      },
      {
        path: "/charts/data-table",
        title: "Table",
        content: require("@/docs/data-table.docs"),
      },
    ],
  },
  {
    title: "Components",
    pages: [
      {
        path: "/components/intro",
        title: "Introduction",
        content: require("@/docs/components"),
      },
      {
        path: "/components/button",
        title: "Button",
        content: require("@/docs/button.docs"),
      },
      {
        path: "/components/chart-selection-tabs",
        title: "Chart Selection Tabs",
        content: require("@/docs/chart-selection-tabs.docs"),
      },
      {
        path: "/components/color-ramp",
        title: "Color Ramp",
        content: require("@/docs/color-ramp.docs"),
      },
      {
        path: "/components/controls",
        title: "Controls",
        content: require("@/docs/controls.docs"),
      },
      {
        path: "/components/dataset-browse",
        title: "Datasets Browsing",
        content: require("@/docs/dataset-browse.docs"),
      },
      {
        path: "/components/footer",
        title: "Footer",
        content: require("@/docs/footer.docs"),
      },
      {
        path: "/components/form",
        title: "Form",
        content: require("@/docs/form.docs"),
      },
      {
        path: "/components/header",
        title: "Header",
        content: require("@/docs/header.docs"),
      },
      {
        path: "/components/hints",
        title: "Hints",
        content: require("@/docs/hint.docs"),
      },
      {
        path: "/components/homepage",
        title: "Homepage",
        content: require("@/docs/homepage.docs"),
      },
      {
        path: "/components/publish-actions",
        title: "Publish actions",
        content: require("@/docs/publish-actions.docs"),
      },
      {
        path: "/components/table",
        title: "Preview Table",
        content: require("@/docs/table.docs"),
      },
      {
        path: "/components/tags",
        title: "Tags",
        content: require("@/docs/tags.docs"),
      },
      {
        path: "/components/tabs",
        title: "Tabs",
        content: require("@/docs/tabs.docs"),
      },
      {
        path: "/components/tooltips",
        title: "Tooltips",
        content: require("@/docs/tooltips.docs"),
      },
      {
        path: "/components/typography",
        title: "Typography",
        content: require("@/docs/text.docs"),
      },
    ],
  },
  {
    path: "/testing",
    title: "Testing",
    content: require("@/docs/testing.mdx"),
  },
];
const mkHeading = (level: number) => {
  const Component = (props: $IntentionalAny) => {
    const slug = useMemo(() => {
      const slugger = new Slugger();
      return slugger.slug(props.children);
    }, [props.children]);
    return (
      <Markdown.Heading level={level} text={[props.children]} slug={slug} />
    );
  };
  Component.displayName = `Heading${level}`;
  return Component;
};

const mdxComponents = {
  wrapper: ({ children }: $IntentionalAny) => <Page>{children}</Page>,
  h1: mkHeading(1),
  h2: mkHeading(2),
  h3: mkHeading(3),
  h4: mkHeading(4),
  h5: mkHeading(5),
  h6: mkHeading(6),
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

const HashHandler = () => {
  useEffect(() => {
    // Scroll to element after page has been rendered
    let timeout = setTimeout(() => {
      const hash =
        location.hash && location.hash !== ""
          ? location.hash.slice(1)
          : undefined;
      if (!hash) {
        return;
      } else {
        const element = document.querySelector("#" + hash);
        element?.scrollIntoView({
          behavior: "smooth",
        });
      }
    }, 1);
    return () => clearTimeout(timeout);
  }, []);
  return null;
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
          basePath="/docs"
          useBrowserHistory
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
        <HashHandler />
      </I18nProvider>
    </MDXProvider>
  ) : null;
};
