import * as React from "react";
function SvgIcMenu(props: React.SVGProps<SVGSVGElement>) {
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
          d="M0 10.287h24v3.429H0v-3.429zm0 8.574h24v3.424H0v-3.424zM0 1.715h24v3.429H0V1.715z"
        />
      </g>
    </svg>
  );
}
export default SvgIcMenu;
