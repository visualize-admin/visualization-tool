import * as React from "react";
function SvgIcOrigin(props: React.SVGProps<SVGSVGElement>) {
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
          d="M5-1v3h4v-3h6v3h4v-3h6v6h-3v4h3v6h-3v4h3v6h-6v-3h-4v3H9v-3H5v3h-6v-6h3v-4.001L-1 15V9l3-.001V5h-3v-6h6zm4 4H5v2H3v3.999L5 9v6l-2-.001V19h2v2h4v-2h6v2h4v-2h2v-4h-2V9h2V5h-2V3h-4v2H9V3zm6 6v6H9V9h6z"
        />
      </g>
    </svg>
  );
}
export default SvgIcOrigin;
