import { GetStaticPaths, GetStaticProps } from "next";
import { staticPages } from "../static-pages";

interface ContentPageProps {
  staticPage: string;
}

const isIndexPath = (p: string[]) =>
  p.length === 0 || (p.length === 1 && p[0] === "index");

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = Object.entries(staticPages).map(([path, { locale }]) => {
    // Assuming p is something like /de/some/page
    const [, localeSegment, ...slug] = path.split("/");

    return {
      params: { slug: isIndexPath(slug) ? undefined : slug },
      locale: localeSegment,
    };
  });

  console.log(JSON.stringify(paths, null, 2));

  return {
    paths,
    // TODO: change to false once https://github.com/vercel/next.js/issues/19934 is fixed
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<ContentPageProps> = async ({
  params,
  locale,
}) => {
  const path = params!.slug
    ? `/${locale}/${(params!.slug as string[]).join("/")}`
    : `/${locale}/index`;

  // FIXME: this check should not be needed when fallback: false can be used
  const pageExists = !!staticPages[path];

  if (!pageExists) {
    console.log("REDIRECTT");
    return {
      notFound: true,
    };
  }

  return {
    props: {
      staticPage: path,
    },
  };
};

export default function ContentPage({ staticPage }: ContentPageProps) {
  const Component = staticPages[staticPage].component;

  return <Component />;
}
