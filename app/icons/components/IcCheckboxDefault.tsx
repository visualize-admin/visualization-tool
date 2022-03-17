import * as React from "react";

function SvgIcCheckboxDefault(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        stroke="currentColor"
        strokeWidth={0.8}
        fill="#FFF"
        x={2.4}
        y={2.4}
        width={19.2}
        height={19.2}
        rx={2.4}
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgIcCheckboxDefault;
