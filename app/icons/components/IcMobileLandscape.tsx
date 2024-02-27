import * as React from "react";
function SvgIcMobileLandscape(props: React.SVGProps<SVGSVGElement>) {
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
          d="M3 9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm16 2.5v1a.5.5 0 101 0v-1a.5.5 0 10-1 0zM5 8v8h13V8H5z"
        />
      </g>
    </svg>
  );
}
export default SvgIcMobileLandscape;
