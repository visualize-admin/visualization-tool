import * as React from "react";

function SvgIcArrowDown(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12.707 4v11.585L18 10.293l1.414 1.414-7.707 7.707L4 11.707l1.414-1.414 5.293 5.292V4h2z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default SvgIcArrowDown;
