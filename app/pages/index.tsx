import { GetStaticPaths, GetStaticProps } from "next";
import { staticPages } from "../static-pages";

/**
 * TODO: this page can be combined with [slug].tsx into [[...slug]].tsx,
 * once these issues are resolved:
 *
 * - https://github.com/vercel/next.js/issues/19934
 * - https://github.com/vercel/next.js/issues/19950
 *
 */

interface ContentPageProps {
  staticPage: string;
}

export default function ContentPage({ staticPage }: ContentPageProps) {
  const Component = staticPages[staticPage].component;

  return Component ? <Component /> : "NOT FOUND";
}

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  return {
    paths:
      locales?.map((locale) => ({
        params: {},
        locale,
      })) ?? [],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ContentPageProps> = async ({
  locale,
}) => {
  const path = `/${locale}/index`;

  // FIXME: this check should not be needed when fallback: false can be used
  const pageExists = !!staticPages[path];

  if (!pageExists) {
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
