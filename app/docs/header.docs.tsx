import { Header, Logo } from "../components/header";
import { LanguageMenu } from "../components/language-menu";
import { markdown, ReactSpecimen } from "catalog";

export default () => markdown`

> Header

~~~
import { Header } from "./components/header"

<Header />
~~~

## Swiss Confederation Logo
${(
  <ReactSpecimen>
    <Logo />
  </ReactSpecimen>
)}

`;
