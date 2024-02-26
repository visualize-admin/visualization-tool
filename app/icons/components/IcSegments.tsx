import * as React from "react";
function SvgIcSegments(props: React.SVGProps<SVGSVGElement>) {
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
          d="M15 6a6 6 0 11-2.999 11.196 6.001 6.001 0 01-2.763.8L9 18a6 6 0 112.999-11.197 5.976 5.976 0 012.741-.797L15 6zM9 8a4 4 0 00-4 4c0 2.21 1.79 4 3.979 4l.195-.004a4.01 4.01 0 001.16-.223A5.984 5.984 0 019 12a5.98 5.98 0 011.335-3.772l-.257-.081A4.01 4.01 0 009 8zm6.021 0l-.205.004-.238.018a3.99 3.99 0 00-.912.205A5.984 5.984 0 0115 12a5.976 5.976 0 01-1.336 3.772A4 4 0 0019 12c0-2.21-1.79-4-3.979-4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcSegments;
