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
  { path: "/branding", title: "Branding", content: require("../docs/branding.mdx") },
  { path: "/branding", title: "Accessibility", content: require("../docs/accessibility.mdx") },
  {
    title: "Materials",
    pages: [
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
        path: "/layout",
        title: "Layout",
        content: require("../docs/layout.mdx")
      }
    ]
  },
  // {
  //   title: "Components",
  //   pages: [
  //     {
  //       path: "/components/loader",
  //       title: "Loader",
  //       content: require("../components/loader.docs")
  //     }
  //   ]
  // }
];

const mdxComponents = {
  wrapper: ({ children }: any) => <Page>{children}</Page>,
  h1: (props: any) => (
    <Markdown.Heading level={1} text={[props.children]} slug={"wat"} />
  ),
  h2: (props: any) => (
    <Markdown.Heading level={2} text={[props.children]} slug={"wat"} />
  ),
  h3: (props: any) => (
    <Markdown.Heading level={3} text={[props.children]} slug={"wat"} />
  ),
  h4: (props: any) => (
    <Markdown.Heading level={4} text={[props.children]} slug={"wat"} />
  ),
  h5: (props: any) => (
    <Markdown.Heading level={5} text={[props.children]} slug={"wat"} />
  ),
  h6: (props: any) => (
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
  a: ({ href, ...props }: any) => <Markdown.Link to={href} {...props} />,
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
