import * as React from "react";
function SvgIcDataset(props: React.SVGProps<SVGSVGElement>) {
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
          d="M16.655.375l4.72 4.72v18.53H2.625V.375h14.03zm-.53.75H3.375v21.75h17.25V5.625h-4.5v-4.5zm.75.53v3.22h3.22l-3.22-3.22zM19.125 12v4.5h-3V12h3zm-3.75-4.5v9h-3v-9h3zm-3.75 3v6h-3v-6h3zm-3.75 3v3h-3v-3h3zm10.5-.75h-1.5v3h1.5v-3zm-3.75-4.5h-1.5v7.5h1.5v-7.5zm-3.75 3h-1.5v4.5h1.5v-4.5zm-3.75 3h-1.5v1.5h1.5v-1.5z"
        />
      </g>
    </svg>
  );
}
export default SvgIcDataset;
