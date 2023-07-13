/* eslint-disable import/no-anonymous-default-export */
import { DatePicker, PickersDay } from "@mui/lab";
import { TextField } from "@mui/material";
import { ReactSpecimen, markdown } from "catalog";
import { useState } from "react";

import { BrowseStateProvider } from "@/browser/context";
import {
  Checkbox,
  Input,
  MinimalisticSelect,
  Radio,
  SearchField,
  Select,
  Switch,
} from "@/components/form";
import SelectTree from "@/components/select-tree";

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

const numberOptions = Array(200)
  .fill(null)
  .map((_x, i) => ({
    value: `example_${i}`,
    label: `Example ${i}`,
  }));

const SelectTreeExample = () => {
  const [value, setValue] = useState("5");
  return (
    <SelectTree
      value={value}
      onChange={({ target: { value } }) => setValue(value)}
      options={[
        {
          value: "1",
          label: "Root",
          children: [{ value: "2", label: "Calendar" }],
        },
        {
          value: "5",
          label: "Switzerland",
          selectable: false,
          children: [
            { value: "10", label: "Bern" },
            {
              value: "6",
              label: "Zürich",
              children: [
                {
                  value: "9",
                  label: "Bürkliplatz",
                  children: [{ value: "7", label: "Pavillion" }],
                },
                {
                  value: "8",
                  label: "Langstrasse",
                },
              ],
            },
          ],
        },
        {
          label: "Numbers",
          value: "numbers",
          selectable: false,
          children: numberOptions,
        },
      ]}
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

  ## MinimalisticSelect

  Can take a smaller prop to make it smaller.

  ${(
    <ReactSpecimen span={2}>
      <MinimalisticSelect
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
            InputProps={{
              onReset: () => alert("reset search"),
            }}
          />
        </BrowseStateProvider>
      </ReactSpecimen>
    )}

  ## Date picker

    ${(
      <ReactSpecimen>
        <DatePicker
          views={["year", "month"]}
          inputFormat="dd/MM/yyyy"
          componentsProps={{}}
          value={new Date(1991, 10, 20)}
          onChange={() => {}}
          renderDay={(date, _, pickersDayProps) => {
            return (
              <PickersDay
                {...pickersDayProps}
                disabled={new Date(date).getDate() % 2 === 1}
              />
            );
          }}
          renderInput={(params) => (
            <TextField hiddenLabel size="small" {...params} />
          )}
        />
      </ReactSpecimen>
    )}

  ## Select tree

    ${(
      <ReactSpecimen>
        <SelectTreeExample />
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
