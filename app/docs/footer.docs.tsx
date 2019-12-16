import { markdown, ReactSpecimen } from "catalog";
import { Footer } from "../components/footer";

export default () => markdown`

> The footer is used to list links to external ressources. It is only displayed on the homepage and on the publication page.

${(
  <ReactSpecimen span={6}>
    <Footer />
  </ReactSpecimen>
)}

`;
