import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Link from "next/link";
import { loadFixtureConfigIds } from "../../test/utils";

type PageProps = {
  ids: string[];
  locale: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    fallback: false,
    paths: [{ params: { locale: "en" } }, { params: { locale: "de" } }],
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const ids = await loadFixtureConfigIds();

  return {
    props: { locale: params?.locale, ids },
  };
};

const Page: NextPage<PageProps> = ({ ids, locale }) => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test Charts</h1>
      <ul>
        {ids.map((id) => (
          <li>
            <Link
              href="/[locale]/__test/[chartId]"
              as={`/${locale}/__test/${id}`}
            >
              <a>{id}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
