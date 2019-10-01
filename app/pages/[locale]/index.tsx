import React from "react";
import { AppLayout } from "../../components/layout";
import { DataCubeProvider } from "../../domain/data-cube";
import { LocalizedLink } from "../../components/links";

const Page = () => {
  return (
    <div>
      <DataCubeProvider endpoint="https://trifid-lindas.test.cluster.ldbar.ch/query">
        <AppLayout>
          <LocalizedLink href={"/[locale]/chart/new"} passHref>
            <a>Create a new chart</a>
          </LocalizedLink>
        </AppLayout>
      </DataCubeProvider>
    </div>
  );
};

export default Page;
