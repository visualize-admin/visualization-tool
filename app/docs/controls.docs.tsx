import { markdown, ReactSpecimen } from "catalog";
import { ColorPalette } from "../components/chart-controls/color-palette";

import {
  ControlSection,
  ControlList,
  ChartTypeRadio
} from "../components/chart-controls";
import { Select, Checkbox, Input } from "../components/form";

// const vegaPalettes: Array<{ id: vega.ColorScheme; values: Array<string> }> = [
//   { id: "category10", values: vega.scheme("category10") },
//   { id: "accent", values: vega.scheme("accent") },
//   { id: "pastel1", values: vega.scheme("pastel1") },
//   { id: "pastel2", values: vega.scheme("pastel2") },
//   { id: "dark2", values: vega.scheme("dark2") }
// ];

const palettes = ["category10", "accent", "pastel1", "pastel2", "dark2"];
export default () => markdown`

## Chart Type Selector
  ${(
    <ReactSpecimen span={2}>
      <ChartTypeRadio
        label={"Linien"}
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
        label={"Scatterplot"}
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
    <ControlSection title="Werteachse" note="y-Achse">
      <ControlList label={"Dimension wählen"}>
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
      <ControlList label={"Eigene Achsenticke"}>
        <Input />
      </ControlList>

      <ControlList label={"Elemente Filtern"}>
        <Checkbox
          label={"Bern"}
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
    </ControlSection>
  </ReactSpecimen>
)}
## Controls list

${(
  <ReactSpecimen span={2}>
    <ControlList label={"Elemente Filtern"}>
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

## Color Palette
  ${(
    <ReactSpecimen span={2}>
      <ColorPalette palettes={palettes} />
    </ReactSpecimen>
  )}

`;
