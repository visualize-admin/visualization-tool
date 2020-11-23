import * as React from "react";

function SvgIcArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 10.707h11.585l-5.292-5.293L11.707 4l7.707 7.707-7.707 7.707L10.293 18l5.292-5.293H4v-2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgIcArrowRight;
