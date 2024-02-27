import * as React from "react";
function SvgIcArrowRight(props: React.SVGProps<SVGSVGElement>) {
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
          d="M4 10.707h11.585l-5.292-5.293L11.707 4l7.707 7.707-7.707 7.707L10.293 18l5.292-5.293H4v-2z"
        />
      </g>
    </svg>
  );
}
export default SvgIcArrowRight;
