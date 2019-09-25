import { NextPage } from "next";
import Router from "next/router";
import React from "react";
import { createChartId } from "../../../domain/chart-id";

const Page: NextPage = () => {
  console.log("you should never see mee")
  return <div>...</div>;
};

Page.getInitialProps = async ({ query, pathname, asPath, res }) => {
  const chartId = createChartId();
  const newAsPath = (asPath as string).replace(/new$/, chartId);

  if (res) {
    console.log("New chart, redirecting to ", newAsPath);
    res.writeHead(302, {
      Location: newAsPath
    });
    res.end();
  } else {
    Router.push(
      `/[locale]/chart/[chartId]`,
      newAsPath
    );
  }

  return { chartId };
};

export default Page;
