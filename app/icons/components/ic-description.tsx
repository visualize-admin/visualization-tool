import * as React from "react";

function SvgIcDescription(props: React.SVGProps<SVGSVGElement>) {
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
          d="M14 17v2H4v-2h10zm6-4v2H4v-2h16zm0-4v2H4V9h16zm0-4v2H4V5h16z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcDescription;
