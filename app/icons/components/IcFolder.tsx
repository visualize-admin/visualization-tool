import * as React from "react";
function SvgIcFolder(props: React.SVGProps<SVGSVGElement>) {
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
          d="M22 11v9a1 1 0 01-1 1H3a1 1 0 01-1-1v-9h20zM9.12 4l1.501 1.29H21a1 1 0 011 1V10H2V5a1 1 0 011-1h6.12z"
        />
      </g>
    </svg>
  );
}
export default SvgIcFolder;
