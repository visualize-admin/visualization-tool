import { markdown, ReactSpecimen } from "catalog";
import { Logo } from "@/components/header";

export default () => markdown`

> The Header is used for brands components and language switch.


## Swiss Confederation Logo
${(
  <ReactSpecimen>
    <Logo />
  </ReactSpecimen>
)}

## How to use
~~~
import { Header } from "./components/header"

<Header />
~~~


`;
