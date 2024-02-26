import * as React from "react";
function SvgIcAnnotationArea(props: React.SVGProps<SVGSVGElement>) {
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
        <path fill="currentColor" d="M0-1v25h25v1H-1V-1h1z" />
        <path fill="currentColor" opacity={0.25} d="M0 11h25v8H0z" />
        <path fill="currentColor" opacity={0.1} d="M5-1h8v25H5z" />
      </g>
    </svg>
  );
}
export default SvgIcAnnotationArea;
