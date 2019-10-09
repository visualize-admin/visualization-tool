import { markdown } from "catalog";

export default () => markdown`
> The component library is based on [rebass](https://rebassjs.org/).

> All styles are defined in a \`theme\` file that can be customized to a specific brand.

## How to use a component

Basic components come with variants. For instance, a button can be styled as a "primary" button by defining this variant on the base Button component:

~~~
import { Button } from "rebass"

<Button variant="primary">
  Click me!
</Button>
~~~
`;
