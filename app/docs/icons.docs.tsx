import * as React from "react";
import { markdown, TableSpecimen } from "catalog";
import { Icon, Icons, IconName } from "../icons";

export default () => markdown`

> Iconography is used throughout user interface of the application. The _Visualization Tool_ uses its own icon set, inspired by the official icon font described on the [«Confederation Web Guidelines»](https://swiss.github.io/styleguide/en/general.html#02-general-08-icons) — featuring consistent proportion and meaning.

${(
  <TableSpecimen
    rows={Object.keys(Icons).map(k => ({
      Icon: <Icon name={k as IconName} size={24} />,
      "Icon (color)": <Icon name={k as IconName} size={24} color="#006699" />,
      "Icon (3rem)": <Icon name={k as IconName} size={48} />,
      "Icon (4rem)": <Icon name={k as IconName} size={64} />,
      Name: k
    }))}
  />
)}
`;
