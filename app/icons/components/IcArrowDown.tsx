import * as React from "react";
function SvgIcArrowDown(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12.707 4v11.585L18 10.293l1.414 1.414-7.707 7.707L4 11.707l1.414-1.414 5.293 5.292V4h2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcArrowDown;
