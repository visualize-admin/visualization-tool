import { markdown, TableSpecimen } from "catalog";
import { Typography } from "@mui/material";
import { useTheme } from "../themes/index";
const pixelSize = 16;

export default () => {
  const theme = useTheme();

  return markdown`

> Text elements are based on \`MUI\` \`<Typography />\` component, with the variants described in the table below. The variant definitions implement the responsive typographic scale defined in [Typography](/typography).

## Accessibility

The variants only refer to styles, they don't generate HTML semantics. For accessibility, always make sure that the headings hierarchy is correct. You can use \`rebass\`'s \`as\` property to explicitly specify the tag to use.

Example of a heading \`h1\` with the style \`heading1\`.
~~~
import { Text } from "@mui/material"

<Typography  variant="h1" component="h1" >
 Heading 1
</Typography>
~~~

## Variants

${(
  <TableSpecimen
    span={6}
    rows={[
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "body1",
      "body2",
      "caption",
      "tag",
    ].map((variant, i) => {
      return {
        Variant: `\`${variant}\``,
        Sample: (
          <Typography
            variant={
              variant as React.ComponentProps<typeof Typography>["variant"]
            }
          >
            The quick brown fox...
          </Typography>
        ),
      };
    })}
  ></TableSpecimen>
)}
`;
};
