import * as React from "react";
function SvgIcLoading(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12 3.938a.562.562 0 110 1.124A6.937 6.937 0 1018.937 12a.563.563 0 011.125 0A8.062 8.062 0 1112 3.937z"
        />
      </g>
    </svg>
  );
}
export default SvgIcLoading;
