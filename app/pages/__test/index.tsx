import { GetStaticProps, NextPage } from "next";
import Link from "next/link";

import { loadFixtureConfigIds } from "@/test/utils";

type PageProps = {
  ids: string[];
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const ids = await loadFixtureConfigIds();

  return {
    props: { locale, ids },
  };
};

const Page: NextPage<PageProps> = ({ ids }) => {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test Charts</h1>
      <ul>
        {ids.map((id) => (
          <li key={id}>
            <Link href={`/__test/${id}`}>
              <a>{id}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Page;
