import { markdown, TableSpecimen } from "catalog";
import { Text } from "rebass";
import { useTheme } from "../themes/index";
const pixelSize = 16;

export default () => {
  const theme = useTheme();

 return markdown`

> Text elements are based on \`rebass\` \`<Text />\` component, with the variants described in the table below. The variant definitions implement the responsive typographic scale defined in [Typography](/typography).

## Accessibility

The variants only refer to styles, they don't generate HTML semantics. For accessibility, always make sure that the headings hierarchy is correct. You can use \`rebass\`'s \`as\` property to explicitly specify the tag to use.

Example of a heading \`h1\` with the style \`heading1\`.
~~~
import { Text } from "rebass"

<Text variant="heading1" as="h1" >
 Heading 1
</Text>
~~~

## Variants

${(
  <TableSpecimen
    span={6}
    rows={Object.entries(theme.text).map(([key, textStyle], i) => {
      return {
        Variant: `\`${key}\``,
        Sample: (
          <Text variant={key} as="h1">
            The quick brown fox...
          </Text>
        )
        // "font-sizes": textStyle.fontSize.map(fs => theme.fontSizes[fs])
      };
    })}
  ></TableSpecimen>
)}

## Reference
The font size and line height values currently in use in the application are listed here.
${(
  <TableSpecimen
    span={3}
    rows={theme.fontSizes.map((d, i) => ({
      index: i,
      "font-size (rem)": d,
      "font-size (px)": `${+(d as string).split("rem")[0] * pixelSize}px`
    }))}
  ></TableSpecimen>
)}
${(
  <TableSpecimen
    span={3}
    rows={theme.lineHeights.map((d, i) => ({
      index: i,
      "line-height (rem)": d,
      "line-height (px)": `${+(d as string).split("rem")[0] * pixelSize}px`
    }))}
  ></TableSpecimen>
)}
`
  };
