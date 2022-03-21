/* eslint-disable import/no-anonymous-default-export */
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
import SearchAutocomplete from "../components/search-autocomplete";
import { BrowseStateProvider } from "../configurator/components/dataset-browse";

const SwitchExample = ({ initialChecked }: { initialChecked?: boolean }) => {
  const [checked, toggle] = useState(initialChecked || false);

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
    <ReactSpecimen span={1}>
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
    <ReactSpecimen span={1}>
      <Checkbox
        label={"Zürich"}
        name={"Zürich"}
        value={"Zürich"}
        checked={true}
        onChange={() => {}}
      />
    </ReactSpecimen>
  )}

  ${["teal", "royalblue", "orange"].map((c) => (
    <ReactSpecimen key={c} span={1}>
      <Checkbox
        label={`${c} checkbox`}
        name={`${c} checkbox`}
        value={`${c} checkbox`}
        color={c}
        onChange={() => {}}
      />
    </ReactSpecimen>
  ))}

## Switch

  ${(
    <ReactSpecimen span={2}>
      <SwitchExample />
    </ReactSpecimen>
  )}

  ${(
    <ReactSpecimen span={2}>
      <SwitchExample initialChecked />
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
        <BrowseStateProvider>
          <SearchField id="search-ex-1" label="Title einfügen" />
        </BrowseStateProvider>
      </ReactSpecimen>
    )}

    ${(
      <ReactSpecimen span={2}>
        <BrowseStateProvider>
          <SearchField
            id="search-ex-2"
            label="Tier"
            value="Affe"
            onReset={() => alert("reset search")}
          />
        </BrowseStateProvider>
      </ReactSpecimen>
    )}


  ## Search autocomplete

  ${(
    <ReactSpecimen span={2}>
      <BrowseStateProvider>
        <SearchAutocomplete
          onSelectedItemChange={({ selectedItem }) => {
            if (selectedItem?.__typename !== "FreeSearchItem") {
              alert(
                `You chose an organisation/theme : ${selectedItem?.label} (${selectedItem?.iri})`
              );
            } else {
              alert(`You free searched: ${selectedItem?.text}`);
            }
          }}
        />
      </BrowseStateProvider>
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
