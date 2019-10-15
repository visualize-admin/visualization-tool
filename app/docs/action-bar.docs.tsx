import { ActionBar } from "../components/action-bar";
import { markdown, ReactSpecimen } from "catalog";
import { Button } from "rebass";

export default () => markdown`


~~~
import { ActionBar } from "./components/action-bar"

<ActionBar>
  {children}
</ActionBar>
~~~

## Action Bar
${(
  <ReactSpecimen span={6}>
    <ActionBar>
      <Button
        variant="secondary"
        onClick={() => {}}
        sx={{ width: "112px", mr: "auto" }}
        disabled={false}
      >
        Zurück
      </Button>
      <Button
        variant="primary"
        onClick={() => {}}
        sx={{ width: "112px", ml: "auto" }}
        disabled={false}
      >
        Weiter
      </Button>
    </ActionBar>
  </ReactSpecimen>
)}

`;
