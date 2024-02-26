import * as React from "react";
function SvgIcTable(props: React.SVGProps<SVGSVGElement>) {
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
          d="M8 17v3H2v-3h6zm7 0v3H9v-3h6zm7 0v3h-6v-3h6zM8 13v3H2v-3h6zm7 0v3H9v-3h6zm7 0v3h-6v-3h6zM8 9v3H2V9h6zm7 0v3H9V9h6zm7 0v3h-6V9h6zm0-5v4H2V4h20z"
        />
      </g>
    </svg>
  );
}
export default SvgIcTable;
