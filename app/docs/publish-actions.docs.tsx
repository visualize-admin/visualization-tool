import { markdown, ReactSpecimen } from "catalog";
import { PublishActions } from "@/components/publish-actions";

export default () => markdown`
> Publish actions is used in the published charts to allow users to share and embed charts in other websites.

${(
  <ReactSpecimen span={2}>
    <PublishActions configKey="123456789" />
  </ReactSpecimen>
)}

## How to use
~~~
import { PublishActions } from "../components/publish-actions";

<PublishActions configKey={configKey} />
~~~

`;
