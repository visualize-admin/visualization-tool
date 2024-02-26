import * as React from "react";
function SvgIcLaptop(props: React.SVGProps<SVGSVGElement>) {
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
          d="M21 4a1 1 0 011 1v12h2v1a2 2 0 01-2 2H2a2 2 0 01-2-2v-1h2V5a1 1 0 011-1zm-6.5 13h-5a.5.5 0 100 1h5a.5.5 0 100-1zM20 6H4v10h16V6z"
        />
      </g>
    </svg>
  );
}
export default SvgIcLaptop;
