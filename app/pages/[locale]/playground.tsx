import { LanguageMenu } from "../../components/language-menu";
import { Trans } from "@lingui/macro";
import { LocalizedLink } from "../../components/links";

const save = () => {
  fetch("/api/config", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: "Hello" })
  })
    .then(res => res.json())
    .then(json => console.log(json));
};

export default () => {
  return (
    <>
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
    </>
  );
};
