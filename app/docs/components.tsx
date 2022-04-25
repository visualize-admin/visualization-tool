import { markdown } from "catalog";

const Doc =  () => markdown`
> The components used in the User Interface are built upon [rebass](https://rebassjs.org/), a library of React primitive UI components.

> All styles are defined in a \`theme\` file [that can be customized to a specific brand](/theming).

## How to use a component

Basic components come with variants. For instance, a button can be styled as a "primary" button by defining this variant on the base Button component:

~~~
import { Button } from "@mui/material"

<Button variant="primary">
  Click me!
</Button>
~~~
`;

export default Doc
