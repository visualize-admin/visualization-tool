import * as React from "react";
function SvgIcPrevious(props: React.SVGProps<SVGSVGElement>) {
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
          d="M6.5 21V3h3v8.256l7.512-7.512v16.512L9.5 12.744V21z"
        />
      </g>
    </svg>
  );
}
export default SvgIcPrevious;
