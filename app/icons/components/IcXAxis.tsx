import * as React from "react";
function SvgIcXAxis(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M6 4v13h9v-3l5 4-5 4v-3H4V4h2zm8.747 0l1.333 2.636L17.448 4h2.324l-2.324 3.794L20 12h-2.53l-1.538-2.946L14.405 12H12l2.576-4.206L12.274 4h2.473z"
        />
      </g>
    </svg>
  );
}
export default SvgIcXAxis;
