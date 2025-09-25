/* eslint-disable import/no-anonymous-default-export */
import { DatePicker, PickersDay } from "@mui/lab";
import { Stack, TextField } from "@mui/material";
import { useState } from "react";

import { BrowseStateProvider } from "@/browse/model/context";
import {
  Checkbox,
  Input,
  Radio,
  SearchField,
  Select,
  Switch,
} from "@/components/form";
import { SelectTree, TreeHierarchyValue } from "@/components/select-tree";

const meta = {
  default: Switch,
  title: "components / Form",
};

export default meta;

const numberOptions = Array(200)
  .fill(null)
  .map((_x, i) => ({
    value: `example_${i}`,
    label: `Example ${i}`,
  }));

export const CheckboxStory = {
  render: () => {
    return (
      <Stack direction="column" gap={2}>
        <Checkbox
          label={"Zürich"}
          name={"Zürich"}
          value={"Zürich"}
          checked={false}
          onChange={() => {}}
        />

        <Checkbox
          label={"Zürich"}
          name={"Zürich"}
          value={"Zürich"}
          checked={true}
          onChange={() => {}}
        />

        {["teal", "royalblue", "orange"].map((c) => (
          <Checkbox
            key={c}
            label={`${c} checkbox`}
            name={`${c} checkbox`}
            value={`${c} checkbox`}
            color={c}
            onChange={() => {}}
          />
        ))}
      </Stack>
    );
  },
};

export { CheckboxStory as Checkbox };

const RadioStory = () => {
  const [state, setState] = useState("Line");
  return (
    <Stack direction="column" gap={2}>
      <Radio
        label={"Scatterplot"}
        name={"Scatterplot"}
        value={"Scatterplot"}
        checked={state === "Scatterplot"}
        onChange={() => setState("Scatterplot")}
      />
      <Radio
        label={"Line"}
        name={"Line"}
        value={"Line"}
        checked={state === "Line"}
        onChange={() => setState("Line")}
      />
    </Stack>
  );
};

export { RadioStory as Radio };

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

const SwitchStory = () => {
  return (
    <Stack direction="row" gap={2}>
      <SwitchExample />
      <SwitchExample initialChecked />

      <Switch
        label={"disabled"}
        name={"disabled"}
        value={"disabled"}
        checked={false}
        disabled
        onChange={() => {}}
      />
    </Stack>
  );
};

export { SwitchStory as Switch };

const SelectStory = {
  render: () => {
    return (
      <Select
        id="dim"
        label="Dimension wählen"
        options={[
          { label: "Nadelholz", value: "Nadelholz" },
          { label: "Laubholz", value: "Laubholz" },
        ]}
      />
    );
  },
};

export { SelectStory as Select };

const SearchFieldStory = {
  render: () => {
    return (
      <Stack direction="row" gap={2}>
        <div>
          <BrowseStateProvider syncWithUrl>
            <SearchField id="search-ex-1" label="Title einfügen" />
          </BrowseStateProvider>
        </div>

        <div>
          <BrowseStateProvider syncWithUrl>
            <SearchField
              id="search-ex-2"
              label="Tier"
              value="Affe"
              InputProps={{
                onReset: () => alert("reset search"),
              }}
            />
          </BrowseStateProvider>
        </div>
      </Stack>
    );
  },
};

export { SearchFieldStory as SearchField };

const DatePickerStory = {
  render: () => (
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
  ),
};

const InputStory = {
  render: () => <Input label="Title einfügen" />,
};

export { InputStory as Input };

export { DatePickerStory as DatePicker };
const SelectTreeStory = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setValue] = useState("5");

    return (
      <SelectTree
        value={value}
        onChange={({ target: { value } }) => {
          setValue(value as string);
        }}
        options={
          [
            {
              value: "1",
              label: "Root",
              children: [
                {
                  value: "2",
                  label: "Calendar",
                },
              ],
            },
            {
              value: "5",
              label: "Switzerland",
              selectable: false,
              children: [
                {
                  value: "10",
                  label: "Bern",
                },
                {
                  value: "6",
                  label: "Zürich",
                  children: [
                    {
                      value: "9",
                      label: "Bürkliplatz",
                      children: [
                        {
                          value: "7",
                          label: "Pavillion",
                        },
                      ],
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
          ] as TreeHierarchyValue[]
        }
      />
    );
  },
};

export { SelectTreeStory as SelectTree };
