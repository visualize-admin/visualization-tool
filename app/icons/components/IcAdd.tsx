import * as React from "react";
function SvgIcAdd(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path fill="currentColor" d="M13 5v6h6v2h-6v6h-2v-6H5v-2h6V5z" />
      </g>
    </svg>
  );
}
export default SvgIcAdd;
