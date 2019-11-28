import { markdown, ReactSpecimen } from "catalog";
import { ActionBar } from "../components/action-bar";
import { ConfiguratorStateProvider } from "../domain";
import { states } from "./fixtures";
import { Text, Box } from "rebass";

export default () =>
  markdown`
> The action bar is a container for components that trigger actions.

## How to use

~~~
import { ActionBar } from "./components/action-bar"

<ActionBar>
  {children}
</ActionBar>
~~~

## Action Bar in different states

${states.map(state => (
  <Box key={state.state} my={4} sx={{width: "100%"}}>
    <Text>{state.state}</Text>
    <ConfiguratorStateProvider chartId={state.state} initialState={state}>
      <ReactSpecimen>
        <ActionBar />
      </ReactSpecimen>
    </ConfiguratorStateProvider>
  </Box>
))}
`;
