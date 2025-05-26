import Link from "next/link";
import { expect, it } from "vitest";

import { replaceLinks } from "@/utils/ui-strings";

it("should work", () => {
  const root = replaceLinks(
    "Draft saved in [My visualizations](/profile)",
    (label, link) => {
      return <Link href={link}>{label}</Link>;
    }
  );
  expect(root).toMatchInlineSnapshot(`
    [
      "Draft saved in ",
      <ForwardRef(LinkComponent)
        href="/profile"
      >
        My visualizations
      </ForwardRef(LinkComponent)>,
      "",
    ]
  `);
});
