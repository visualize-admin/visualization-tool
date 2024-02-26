import * as React from "react";
function SvgIcColumn(props: React.SVGProps<SVGSVGElement>) {
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
          d="M22 3v18H2V3h20zM8 5H4v14h4V5zm6 0h-4v14h4V5zm6 0h-4v14h4V5z"
        />
      </g>
    </svg>
  );
}
export default SvgIcColumn;
