import "isomorphic-unfetch";
import { NextPage } from "next";
import { AppLayout } from "../../components/layout";
import { useLocale } from "../../lib/use-locale";
import { Heading } from "rebass";

const Page: NextPage<{ config: { key: string; data: any } | undefined }> = ({
  config
}) => {
  const locale = useLocale();

  console.log(config);

  return (
    <AppLayout>
      <Heading fontSize={5}>
        {config ? config.data.title[locale] : "???"}
      </Heading>
    </AppLayout>
  );
};

Page.getInitialProps = async ({ req, query }) => {
  const config = await fetch(
    `http://localhost:3000/api/config/${query.key}`
  ).then(res => res.json());
  if (config && config.data) {
    return { config };
  }

  return { config: undefined };
};

export default Page;
