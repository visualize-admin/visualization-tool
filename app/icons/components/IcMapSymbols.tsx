import * as React from "react";
function SvgIcMapSymbols(props: React.SVGProps<SVGSVGElement>) {
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
          d="M6 10.8a6 6 0 110 12 6 6 0 010-12zm0 2a4 4 0 100 8 4 4 0 000-8zm12.6-4.1a5.4 5.4 0 110 10.8 5.4 5.4 0 010-10.8zm0 2a3.4 3.4 0 100 6.8 3.4 3.4 0 000-6.8zM11 1a4.3 4.3 0 110 8.6A4.3 4.3 0 0111 1zm0 2a2.3 2.3 0 100 4.6A2.3 2.3 0 0011 3z"
        />
      </g>
    </svg>
  );
}
export default SvgIcMapSymbols;
