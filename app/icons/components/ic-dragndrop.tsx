import * as React from "react";

function SvgIcDragndrop(props: React.SVGProps<SVGSVGElement>) {
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
          d="M11 18v3H8v-3h3zm5 0v3h-3v-3h3zm-5-5v3H8v-3h3zm5 0v3h-3v-3h3zm-5-5v3H8V8h3zm5 0v3h-3V8h3zm-5-5v3H8V3h3zm5 0v3h-3V3h3z"
        />
      </g>
    </svg>
  );
}

export default SvgIcDragndrop;
