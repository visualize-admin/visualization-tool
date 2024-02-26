import * as React from "react";
function SvgIcTableColumnTime(props: React.SVGProps<SVGSVGElement>) {
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
          d="M15 9v2h4V9h2v2h1a1 1 0 011 1v8a1 1 0 01-1 1H12a1 1 0 01-1-1v-8a1 1 0 011-1h1V9h2zm-6 8v3H2v-3h7zm12-3h-8v5h8v-5zM9 13v3H2v-3h7zm0-4v3H2V9h7zm13-5v4H2V4h20z"
        />
      </g>
    </svg>
  );
}
export default SvgIcTableColumnTime;
