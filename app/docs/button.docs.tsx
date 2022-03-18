import { Button } from "@mui/material";
import { markdown, ReactSpecimen } from "catalog";
import { Icon } from "../icons";
import SvgIcChevronRight from "../icons/components/IcChevronRight";
import SvgIcChevronLeft from "../icons/components/IcChevronLeft";

export default () => markdown`
> Buttons are used to trigger an event after a user interaction.

There are four basic styles that are styles defined in \`theme-ui\`'s \`variants\`:

- \`primary\`
- \`primary-small\`
- \`secondary\`
- \`success\`
- \`inline\`
- \`inline-bold\`


  ${(
    <ReactSpecimen span={2}>
      <Button
        startIcon={<Icon name="linkExternal" />}
        variant="contained"
        color="primary"
      >
        <span>Primary button</span>
      </Button>
    </ReactSpecimen>
  )}


  ${(
    <ReactSpecimen span={2}>
      <Button variant="contained" color="secondary">
        Secondary button
      </Button>
    </ReactSpecimen>
  )}


  ${(
    <ReactSpecimen span={2}>
      <Button variant="contained" color="success">
        Success button
      </Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Button variant="outlined">Outlined button</Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Button startIcon={<SvgIcChevronLeft />} variant="text">
        <span>Inline button</span>
      </Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Button size="small" startIcon={<SvgIcChevronLeft />} variant="text">
        Bold inline button
      </Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        endIcon={<SvgIcChevronRight />}
      >
        Publish this dataset
      </Button>
    </ReactSpecimen>
  )}

  ## How to use

~~~
import { Button } from "@mui/material"
import SvgIcChevronRight from "../icons/components/IcChevronRight";
import SvgIcChevronLeft from "../icons/components/IcChevronLeft";

<Button variant="primary">
  Primary button
</Button>
~~~
`;
