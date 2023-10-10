import groupBy from "lodash/groupBy";
import { GetStaticProps, NextPage } from "next";
import Link from "next/link";

import { PromiseValue } from "@/domain/types";
import { loadFixtureConfigs } from "@/test/utils";

type PageProps = {
  configs: PromiseValue<ReturnType<typeof loadFixtureConfigs>>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const configs = await loadFixtureConfigs();

  return {
    props: { locale, configs },
  };
};

const configDescription = {
  int: (
    <>
      Uses <strong>int.lindas.admin.ch</strong>, can be used locally and on{" "}
      <strong>test.visualize.admin.ch</strong>.
    </>
  ),
  prod: (
    <>
      Uses <strong>lindas.admin.ch</strong>, can be used on{" "}
      <strong>visualize.admin.ch</strong> and{" "}
      <strong>int.visualize.admin.ch</strong>.
    </>
  ),
};

const Page: NextPage<PageProps> = ({ configs }) => {
  const byEnv = groupBy(configs, (x) => x.env);
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Test Charts</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridGap: "2rem",
        }}
      >
        {(["int", "prod"] as const).map((env) => {
          const configs = byEnv[env];
          if (!configs || !configs.length) {
            return null;
          }
          return (
            <div key={env}>
              <h2>{env}</h2>
              <p>{configDescription[env]}</p>
              <ul>
                {configs.map(({ name, chartId, slug }) => (
                  <li key={chartId}>
                    <Link
                      href={`/__test/${env}/${slug}`}
                      passHref
                      legacyBehavior
                    >
                      <a>{name}</a>
                    </Link>
                    <br />
                    {chartId}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Page;
