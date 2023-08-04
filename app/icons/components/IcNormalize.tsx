import * as React from "react";

function SvgIcNormalize(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M14 15L14 22L10 22L10 15L14 15Z" fill="currentColor" />
        <path d="M7 10L7 22L3 22L3 10L7 10Z" fill="currentColor" />
        <path d="M21 10L21 22L17 22L17 10L21 10Z" fill="currentColor" />
        <path d="M7 2L7 8L3 8L3 2L7 2Z" fill="currentColor" />
        <path d="M21 2L21 8L17 8L17 2L21 2Z" fill="currentColor" />
        <path d="M14 2L14 13L10 13L10 2L14 2Z" fill="currentColor" />
      </g>
    </svg>
  );
}

export default SvgIcNormalize;
