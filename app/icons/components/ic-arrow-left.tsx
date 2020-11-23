import * as React from "react";

function SvgIcArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M19.414 12.707H7.83L13.121 18l-1.414 1.414L4 11.707 11.707 4l1.414 1.414-5.292 5.293h11.585v2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export default SvgIcArrowLeft;
