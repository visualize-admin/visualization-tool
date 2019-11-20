import { markdown, ReactSpecimen } from "catalog";
import {
  ChartTypeRadio,
  ControlList,
  CollapsibleSection
} from "../components/chart-controls";
import { Checkbox, Input, Select, Radio } from "../components/form";

// const vegaPalettes: Array<{ id: vega.ColorScheme; values: Array<string> }> = [
//   { id: "category10", values: vega.scheme("category10") },
//   { id: "accent", values: vega.scheme("accent") },
//   { id: "pastel1", values: vega.scheme("pastel1") },
//   { id: "pastel2", values: vega.scheme("pastel2") },
//   { id: "dark2", values: vega.scheme("dark2") }
// ];

// const palettes = ["category10", "accent", "pastel1", "pastel2", "dark2"];
export default () => markdown`

> Controls are a composition of layout components and form elements, used throughout the application to configurate charts.

## Chart Type Selector
  ${(
    <ReactSpecimen span={2}>
      <ChartTypeRadio
        label={"line"}
        name={"Linien"}
        value={"Linien"}
        onChange={e => {
          console.log(e.currentTarget.value);
        }}
      />
    </ReactSpecimen>
  )}
  ${(
    <ReactSpecimen span={2}>
      <ChartTypeRadio
        label={"scatterplot"}
        name={"Scatterplot"}
        value={"Scatterplot"}
        checked={true}
        onChange={e => {
          console.log(e.currentTarget.value);
        }}
      />
    </ReactSpecimen>
  )}

## Controls section
A section is a styling container, it has a title and a note (displayed on the right). Any component can be given as child component.
${(
  <ReactSpecimen span={6}>
    <CollapsibleSection title="Werteachse">
      <ControlList>
        <Select
          options={[
            { label: "Kanton", value: "Kanton" },
            { label: "Eigentümertyp", value: "Eigentümertyp" }
          ]}
        />
        <Select
          options={[
            { label: "Kanton", value: "Kanton" },
            { label: "Eigentümertyp", value: "Eigentümertyp" }
          ]}
        />
      </ControlList>
      <ControlList>
        <Input />
      </ControlList>

      <ControlList>
        <Checkbox
          label={"Bern"}
          checked={true}
          name={"Bern"}
          value={"Bern"}
          onChange={() => {}}
        />
        <Checkbox
          label={"Aargau"}
          name={"Aargau"}
          value={"Aargau"}
          onChange={() => {}}
        />
        <Checkbox
          label={"Ticino"}
          name={"Ticino"}
          value={"Ticino"}
          onChange={() => {}}
        />
      </ControlList>
      <ControlList>
        <Radio
          label={"Bern"}
          checked={true}
          name={"Bern"}
          value={"Bern"}
          onChange={() => {}}
        />
        <Radio
          label={"Aargau"}
          name={"Aargau"}
          value={"Aargau"}
          onChange={() => {}}
        />
        <Radio
          label={"Ticino"}
          name={"Ticino"}
          value={"Ticino"}
          onChange={() => {}}
        />
      </ControlList>
    </CollapsibleSection>
  </ReactSpecimen>
)}
## Controls list

${(
  <ReactSpecimen span={2}>
    <ControlList>
      <Checkbox
        label={"Scatterplot"}
        name={"Scatterplot"}
        value={"Scatterplot"}
        onChange={() => {}}
      />
      <Checkbox
        label={"Line Chart"}
        name={"Line Chart"}
        value={"Line Chart"}
        onChange={() => {}}
      />
      <Checkbox
        label={"Bar chart"}
        name={"Bar chart"}
        value={"Bar chart"}
        onChange={() => {}}
      />
    </ControlList>
  </ReactSpecimen>
)}


`;
