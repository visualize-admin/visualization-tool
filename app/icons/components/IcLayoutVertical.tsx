import * as React from "react";

function SvgIcLayoutVertical(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 2H22V8H2V2ZM2 9H22V15H2V9ZM22 16H2V22H22V16Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default SvgIcLayoutVertical;
