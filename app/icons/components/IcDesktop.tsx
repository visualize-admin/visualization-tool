import * as React from "react";
function SvgIcDesktop(props: React.SVGProps<SVGSVGElement>) {
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
          d="M22 2a1 1 0 011 1v14a1 1 0 01-1 1h-8v2h2v2H8v-2h2v-2H2a1 1 0 01-1-1V3a1 1 0 011-1zm-1 2H3v10h18V4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcDesktop;
