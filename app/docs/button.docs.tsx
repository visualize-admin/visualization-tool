import { Button } from "rebass";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`
> Buttons are used to trigger an event after a user interaction.

There are three basic styles that are styles defined in \`rebass\`'s \`variants\`:

- \`primary\`
- \`secondary\`
- \`success\`

~~~
import { Button } from "rebass"

<Button variant="primary">
  Primary button
</Button>
~~~


  ${(
    <ReactSpecimen span={2}>
      <Button variant="primary">Primary button</Button>
    </ReactSpecimen>
  )}


  ${(
    <ReactSpecimen span={2}>
      <Button variant="secondary">Secondary button</Button>
    </ReactSpecimen>
  )}


  ${(
    <ReactSpecimen span={2}>
      <Button variant="success">Success button</Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Button variant="outline">Outline button</Button>
    </ReactSpecimen>
  )}
`;
