import React from "react";
import { useRouter } from "next/router";
import { Trans } from "@lingui/macro";

const save = () => {
  fetch("/api/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: "Hello" })
  })
    .then(res => res.json())
    .then(json => console.log(json.answer));
};

const Page = () => {
  const { query } = useRouter();

  return (
    <div>
      <Trans>Hallo Welt!</Trans>
      <button onClick={save}>Save</button>
    </div>
  );
};

export default Page;
