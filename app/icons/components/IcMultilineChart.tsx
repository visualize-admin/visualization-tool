import * as React from "react";
function SvgIcMultilineChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19.424 10.219l-3.182 2.437-.112-.067a545.1 545.1 0 00-2.654-1.559l-.246-.136-.238.15c-.142.088-.902.672-2.447 1.866-.267.208-.503.39-.666.515l-1.312-.765-2.692 1.683.5.876 2.21-1.383 1.338.781.246-.153c.04-.025.687-.525.987-.756.668-.517 1.662-1.286 2.12-1.63l1.378.81 1.66.977L20 11.043l-.575-.824zM14.213 8.011l5.429 1.51.248-1.049-5.8-1.614-.051-.014-3.883 2.724-3.875-2.541-.515.927 4.408 2.89 4.04-2.833z"
        fill="currentColor"
      />
      <path d="M4.998 16.923V4H4v14h15.972v-1.077H4.998z" fill="currentColor" />
    </svg>
  );
}
export default SvgIcMultilineChart;
