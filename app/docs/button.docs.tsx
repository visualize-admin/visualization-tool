import { Button } from "theme-ui";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`
> Buttons are used to trigger an event after a user interaction.

There are four basic styles that are styles defined in \`theme-ui\`'s \`variants\`:

- \`primary\`
- \`secondary\`
- \`success\`
- \`inline\`


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
  ${(
    <ReactSpecimen span={2}>
      <Button variant="inline">Inline button</Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Button variant="inline-bold">Bold inline button</Button>
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <Button variant="primary-small">Primary small button</Button>
    </ReactSpecimen>
  )}

  ## How to use

~~~
import { Button } from "theme-ui"

<Button variant="primary">
  Primary button
</Button>
~~~
`;
