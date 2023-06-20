import { GetStaticPaths, GetStaticProps } from "next";

import { ContentMDXProvider } from "@/components/content-mdx-provider";
import { staticPages } from "@/static-pages";

/**
 * TODO: this page can be combined with index.tsx into [[...slug]].tsx,
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
  const Component = staticPages[staticPage]?.component;

  return (
    <ContentMDXProvider>
      {Component ? <Component /> : "NOT FOUND"}
    </ContentMDXProvider>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    // TODO: change to false once https://github.com/vercel/next.js/issues/19934 is fixed
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<ContentPageProps> = async ({
  params,
  locale,
}) => {
  const path = `/${locale}/${params!.slug as string}`;

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
