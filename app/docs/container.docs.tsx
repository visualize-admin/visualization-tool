import { markdown, ReactSpecimen } from "catalog";
import { Container } from "../components/container";

export default () => markdown`

> Containers are wrapper for content. They are used internally for laying out children components.


## Primary Container
${(
  <ReactSpecimen>
    <div style={{ height: 300, width: 250 }}>
      <Container side="left">
        <div style={{ height: 300, width: 150 }}></div>
      </Container>
    </div>
  </ReactSpecimen>
)}



`;
