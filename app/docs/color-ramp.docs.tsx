import { markdown } from "catalog";
import { interpolateBrBG, interpolateOranges } from "d3-scale-chromatic";
import { Box } from "theme-ui";
import { ColorRamp } from "../configurator/components/chart-controls/color-ramp";

export default () =>
  markdown`
> <ColorRamp> is able to display all values from a color interpolator (currently suited to the ones from D3).

## How to use

~~~
import { ColorRamp } from "./components/chart-controls/color-ramp"

<ColorRamp colorInterpolator={colorInterpolator} width={width} height={height} nbClass={nbClass} disabled={disabled} />
~~~

### Continuous

~~~
<ColorRamp colorInterpolator={interpolateOranges} />
~~~

${(
  <Box sx={{ mt: 3 }}>
    <ColorRamp colorInterpolator={interpolateOranges} />
  </Box>
)}

### Discrete

~~~
<ColorRamp colorInterpolator={interpolateOranges} nbClass={5} />
~~~

${(
  <Box sx={{ mt: 3 }}>
    <ColorRamp colorInterpolator={interpolateOranges} nbClass={5} />
  </Box>
)}

### Custom width and height

~~~
<ColorRamp colorInterpolator={interpolateBrBG} width={100} height={100} />
~~~

${(
  <Box sx={{ mt: 3 }}>
    <ColorRamp colorInterpolator={interpolateBrBG} width={100} height={100} />
  </Box>
)}

### Disabled

~~~
<ColorRamp colorInterpolator={interpolateBrBG} width={100} height={100} disabled={true} />
~~~

${(
  <Box sx={{ mt: 3 }}>
    <ColorRamp
      colorInterpolator={interpolateBrBG}
      width={100}
      height={100}
      disabled={true}
    />
  </Box>
)}

## ColorRampField

> <ColorRampField> is a custom select element which can be used to display and select several palette categories. You need to use it inside of <ConfiguratorStateProvider> so it can access and update the state.

~~~
<ColorRampField field={field} path={path} nbClass={nbClass} disabled={disabled} />
~~~
`;
