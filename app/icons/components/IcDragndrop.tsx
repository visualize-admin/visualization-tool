import * as React from "react";
function SvgIcDragndrop(props: React.SVGProps<SVGSVGElement>) {
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
          d="M8 6h3v3H8V6zm5 0h3v3h-3V6zm-5 5h3v3H8v-3zm5 0h3v3h-3v-3zm-5 5h3v3H8v-3zm5 0h3v3h-3v-3z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
export default SvgIcDragndrop;
