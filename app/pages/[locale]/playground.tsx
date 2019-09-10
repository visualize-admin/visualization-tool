import { Trans } from "@lingui/macro";
import { AppLayout } from "../../components/layout";
import { LocalizedLink } from "../../components/links";

const save = () => {
  fetch("/api/save", {
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
    <AppLayout>
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
    </AppLayout>
  );
};
