import { GetServerSideProps } from "next";
import { defaultLocale } from "../locales/locales";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  res.writeHead(302, { Location: `/${defaultLocale}` });
  res.end();
  return { props: {} };
};

export default () => <div></div>;
