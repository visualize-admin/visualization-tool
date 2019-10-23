import { ActionBar } from "../components/action-bar";
import { markdown, ReactSpecimen } from "catalog";
import { Button } from "rebass";

export default () => markdown`

> The action bar is a container for components that trigger actions.

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

## How to use
~~~
import { ActionBar } from "./components/action-bar"

<ActionBar>
  {children}
</ActionBar>
~~~


`;
