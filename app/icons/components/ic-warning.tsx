import * as React from "react";

function SvgIcWarning(props: React.SVGProps<SVGSVGElement>) {
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
          d="M32 11l22 42H10l22-42zm0 4L13 51h38L32 15zm0 28a2 2 0 110 4 2 2 0 010-4zm1-16v12h-2V27h2z"
          fill="#757575"
        />
      </g>
    </svg>
  );
}

export default SvgIcWarning;
