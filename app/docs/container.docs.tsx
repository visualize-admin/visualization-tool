import { markdown, ReactSpecimen } from "catalog";
import { Container, MiddleContainer } from "../components/container";

export default () => markdown`

> Containers are wrapper for content. They are used internally for laying out children components.


## Primary Container
${(
  <ReactSpecimen>
    <div style={{ height: 300, width: 250 }}>
      <Container title="Datensatz auswählen">
        <div style={{ height: 300, width: 150 }}></div>
      </Container>
    </div>
  </ReactSpecimen>
)}

## Chart Container
${(
  <ReactSpecimen>
    <MiddleContainer>
      <div style={{ height: 300 }}></div>
    </MiddleContainer>
  </ReactSpecimen>
)}

`;
