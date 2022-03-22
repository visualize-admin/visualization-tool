import * as React from "react";

function SvgIcCheckboxActive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <rect fill="currentColor" x={2} y={2} width={20} height={20} rx={3} />
        <path d="M2 2h20v20H2z" />
        <path
          d="M10.333 16.583L5.75 12 7 10.75l3.333 3.333L17 7.417l1.25 1.25z"
          fill="#FFF"
        />
      </g>
    </svg>
  );
}

export default SvgIcCheckboxActive;
