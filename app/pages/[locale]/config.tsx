import "isomorphic-unfetch";
import { NextPage } from "next";
import { AppLayout } from "../../components/layout";
import { useLocale } from "../../lib/use-locale";
import { Heading } from "@theme-ui/components";

const Page: NextPage<{
  config: { key: string; data: $IntentionalAny } | undefined;
}> = ({ config }) => {
  const locale = useLocale();

  console.log(config);

  return (
    <AppLayout>
      <Heading sx={{ fontSize: 5 }}>
        {config ? config.data.title[locale] : "???"}
      </Heading>
    </AppLayout>
  );
};

Page.getInitialProps = async ({ req, query, res }) => {
  const uri = res
    ? `http://localhost:${process.env.PORT || 3000}/api/config/${query.key}`
    : `/api/config/${query.key}`;
  const config = await fetch(uri).then(res => res.json());
  if (config && config.data) {
    return { config };
  }

  return { config: undefined };
};

export default Page;
