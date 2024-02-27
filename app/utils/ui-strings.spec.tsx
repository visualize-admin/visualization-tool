import Link from "next/link";

import { replaceLinks } from "@/utils/ui-strings";

it("should work", () => {
  const root = replaceLinks(
    "Draft saved in [My visualisations](/profile)",
    (label, link) => {
      return <Link href={link}>{label}</Link>;
    }
  );
  expect(root).toMatchInlineSnapshot(`
    Array [
      "Draft saved in ",
      <ForwardRef(LinkComponent)
        href="/profile"
      >
        My visualisations
      </ForwardRef(LinkComponent)>,
      "",
    ]
  `);
});
