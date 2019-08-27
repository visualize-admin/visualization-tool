import React from "react";
import { useRouter } from "next/router";

const Page = () => {
  const { query } = useRouter();

  console.log(query.foo);

  return <div>Hello, world</div>;
};

export default Page;
