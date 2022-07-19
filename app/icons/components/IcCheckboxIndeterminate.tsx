import * as React from "react";

function SvgIcCheckboxIndeterminate(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <rect fill="#069" x={2} y={2} width={20} height={20} rx={3} />
        <path fill="#FFF" d="M6 11h12v2H6z" />
      </g>
    </svg>
  );
}

export default SvgIcCheckboxIndeterminate;
