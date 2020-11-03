import { markdown, ReactSpecimen } from "catalog";
import React, { useState } from "react";
import {
  Radio,
  Checkbox,
  Select,
  Input,
  MiniSelect,
  SearchField,
  Switch,
} from "../components/form";

const SwitchExample = () => {
  const [checked, toggle] = useState(false);

  return (
    <Switch
      label={"foo"}
      name={"foo"}
      checked={checked}
      onChange={() => toggle(!checked)}
    />
  );
};

export default () => markdown`
> Form elements are used throughout the _Visualization Tool_ whenever user input is needed.

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

## Switch

  ${(
    <ReactSpecimen span={2}>
      <SwitchExample />
    </ReactSpecimen>
  )}

  ${(
    <ReactSpecimen span={2}>
      <Switch
        label={"disabled"}
        name={"disabled"}
        value={"disabled"}
        checked={false}
        disabled
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ## Select

  ${(
    <ReactSpecimen span={2}>
      <Select
        id="dim"
        label="Dimension wählen"
        options={[
          { label: "Nadelholz", value: "Nadelholz" },
          { label: "Laubholz", value: "Laubholz" },
        ]}
      />
    </ReactSpecimen>
  )}

  ## MiniSelect

  ${(
    <ReactSpecimen span={2}>
      <MiniSelect
        id="dim"
        label="Dimension wählen"
        options={[
          { label: "Nadelholz", value: "Nadelholz" },
          { label: "Laubholz", value: "Laubholz" },
        ]}
      />
    </ReactSpecimen>
  )}

  ## Input

  ${(
    <ReactSpecimen span={2}>
      <Input label="Title einfügen" />
    </ReactSpecimen>
  )}

  ## Search Field

    ${(
      <ReactSpecimen span={2}>
        <SearchField id="search-ex-1" label="Title einfügen" />
      </ReactSpecimen>
    )}

    ${(
      <ReactSpecimen span={2}>
        <SearchField
          id="search-ex-2"
          label="Tier"
          value="Affe"
          onReset={() => alert("reset search")}
        />
      </ReactSpecimen>
    )}

  # For developers

  ## How to use

~~~
import { Radio, Checkbox, Select, Input } from "../components/form";

<Radio
  label={"Scatterplot"}
  name={"Scatterplot"}
  value={"Scatterplot"}
/>
~~~

### \`<Field />\`
Internally, all form elements rely on the component \`<Field />\`. The html element to render can be defined with the \`type\` props and must be one of \`text\`, \`checkbox\`, \`radio\`, \`input\`, \`select\`.

~~~
import { Field } from "../components/field";

<Field
  type="radio"
  chartId="AHhgGxoZRC"
  path={"height"}
  label="variable"
  value="http://..."
/>
~~~


  ### \`useField()\`
  This hook handles form events and dispatches an action to update the application state stored in local storage.
`;
