import { markdown, ReactSpecimen } from "catalog";
import { Radio, Checkbox, Select, Input } from "../components/form";

export default () => markdown`
> Form elements

~~~
import { Label, Radio } from "rebass"

<Label for="#red">
  <Radio name="color" id="red" value="red" />
  Red
</Label>
~~~

## Radio button


${(
  <ReactSpecimen span={2}>
    <Radio
      label={"Scatterplot"}
      name={"Scatterplot"}
      value={"Scatterplot"}
      checked={false}
      onChange={() => {}}
    />
  </ReactSpecimen>
)}
  ${(
    <ReactSpecimen span={2}>
      <Radio
        label={"Scatterplot"}
        name={"Scatterplot"}
        value={"Scatterplot"}
        checked={true}
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ## Checkbox

  ${(
    <ReactSpecimen span={2}>
      <Checkbox
        label={"Zürich"}
        name={"Zürich"}
        value={"Zürich"}
        checked={false}
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ${(
    <ReactSpecimen span={2}>
      <Checkbox
        label={"Zürich"}
        name={"Zürich"}
        value={"Zürich"}
        checked={true}
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ## Select

  ${(
    <ReactSpecimen span={2}>
      <Select
        label="Dimension wählen"
        options={[
          { name: "Nadelholz", value: "Nadelholz" },
          { name: "Laubholz", value: "Laubholz" }
        ]}
        onChange={e => console.log(e.currentTarget.value)}
      />
    </ReactSpecimen>
  )}

  ## Input

  ${(
    <ReactSpecimen span={2}>
      <Input />
    </ReactSpecimen>
  )}
`;
