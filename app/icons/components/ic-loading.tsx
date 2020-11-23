import * as React from "react";

function SvgIcLoading(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h64v64H0z" />
        <path
          d="M32 12c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20"
          stroke="#757575"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
      </g>
    </svg>
  );
}

export default SvgIcLoading;
