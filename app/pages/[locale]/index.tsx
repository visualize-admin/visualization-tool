import React from "react";
import { useRouter } from "next/router";
import { Trans } from "@lingui/macro";
import { LocalizedLink, CurrentPageLink } from "../../components/links";
import { LanguageMenu } from "../../components/language-menu";

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
  return (
    <div>
      <LanguageMenu />
      <Trans>Hallo Welt!</Trans>
      <button onClick={save}>Save</button>
      <LocalizedLink href="/[locale]/foo">
        <a>Foo</a>
      </LocalizedLink>
      <LocalizedLink
        href={{ pathname: "/[locale]/foo", query: { foo: "bar" } }}
      >
        <a>Foo</a>
      </LocalizedLink>
    </div>
  );
};

export default Page;
