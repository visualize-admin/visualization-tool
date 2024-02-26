import * as React from "react";
function SvgIcArrowUp(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12.707 19.414V7.829L18 13.121l1.414-1.414L11.707 4 4 11.707l1.414 1.414 5.293-5.292v11.585h2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcArrowUp;
