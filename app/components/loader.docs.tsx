import { Loader } from "../components/loader";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`

> This component is displayed when waiting for a promise to resolve.
  ${(
    <ReactSpecimen>
      <Loader body="Loading data..." />
    </ReactSpecimen>
  )}
`;
