import * as React from "react";

function SvgIcFolder(props: React.SVGProps<SVGSVGElement>) {
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
        <path
          d="M22 11v9a1 1 0 01-1 1H3a1 1 0 01-1-1v-9h20zM9.12 4l1.501 1.29H21a1 1 0 011 1V10H2V5a1 1 0 011-1h6.12z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcFolder;
