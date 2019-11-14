import { markdown } from "catalog";

export default () => markdown`
> The action bar is a container for components that trigger actions.

## How to use

~~~
import { ActionBar } from "./components/action-bar"

<ActionBar>
  {children}
</ActionBar>
~~~
`;
