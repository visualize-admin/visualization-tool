/* eslint-disable import/no-anonymous-default-export */
import { c } from "@interactivethings/swiss-federal-ci";
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
    content: require("@/docs/catalog/index.mdx"),
  },
  {
    path: "/branding",
    title: "Branding",
    content: require("@/docs/catalog/branding.mdx"),
  },
  // {
  //   path: "/accessibility",
  //   title: "Accessibility",
  //   content: require("@/docs/catalog/accessibility.mdx"),
  // },
  // {
  //   title: "Theming",
  //   pages: [
  //     {
  //       path: "/theming",
  //       title: "Overview",
  //       content: require("@/docs/catalog/theming.mdx"),
  //     },
  //     {
  //       path: "/colors",
  //       title: "Colors",
  //       content: require("@/docs/catalog/colors.mdx"),
  //     },
  //     {
  //       path: "/layout",
  //       title: "Layout",
  //       content: require("@/docs/catalog/layout.mdx"),
  //     },
  //   ],
  // },
  {
    title: "Design Concept",
    pages: [
      {
        path: "/mockups",
        title: "Mockups",
        content: require("@/docs/catalog/mockups"),
      },
      {
        path: "/chart-config",
        title: "Chart-Config",
        content: require("@/docs/catalog/chart-config"),
      },
    ],
  },
  {
    title: "Charts",
    pages: [
      {
        path: "/charts/rdf-to-visualize",
        title: "RDF to visualize",
        content: require("@/docs/catalog/rdf-to-visualize.mdx"),
      },
      // {
      //   path: "/charts/preview-via-api",
      //   title: "Previewing charts",
      //   content: require("@/docs/catalog/chart-preview-via-api.mdx"),
      // },
    ],
  },
  {
    path: "/api",
    title: "API",
    content: require("@/docs/catalog/chart-preview-via-api.mdx"),
  },
  {
    title: "Components",
    pages: [
      {
        path: "/components/intro",
        title: "Introduction",
        content: require("@/docs/catalog/components"),
      },
    ],
  },
  {
    path: "/testing",
    title: "Testing",
    content: require("@/docs/catalog/testing.mdx"),
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
          title="Visualize"
          pages={pages}
          theme={{
            brandColor: "#333",
            sidebarColorText: "#333",
            navBarTextColor: "#333",
            sidebarColorHeading: "#333",
            pageHeadingTextColor: "#fff",
            linkColor: "rgb(255,95,85)",
            sidebarColorTextActive: "rgb(255,95,85)",
            background: c.monochrome[100],
            pageHeadingBackground: "#156896",
          }}
        />
        <HashHandler />
      </I18nProvider>
    </MDXProvider>
  ) : null;
};
