import * as React from "react";
function SvgIcArrowLeft(props: React.SVGProps<SVGSVGElement>) {
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
          d="M19.414 12.707H7.829L13.121 18l-1.414 1.414L4 11.707 11.707 4l1.414 1.414-5.292 5.293h11.585v2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcArrowLeft;
