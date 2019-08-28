import React from "react";
import { useRouter } from "next/router";
import { Trans } from "@lingui/macro";

const Page = () => {
  const { query } = useRouter();

  return (
    <div>
      <Trans>Hallo Welt!</Trans>
    </div>
  );
};

export default Page;
