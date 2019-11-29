import { markdown, ReactSpecimen } from "catalog";
import { Embed } from "../components/publish-actions";

export default () => markdown`
> Publish actions

${(
  <ReactSpecimen span={2}>
    <Embed configKey="123456789" />
  </ReactSpecimen>
)}

`;
