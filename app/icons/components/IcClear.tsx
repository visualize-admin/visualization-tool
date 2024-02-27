import * as React from "react";
function SvgIcClear(props: React.SVGProps<SVGSVGElement>) {
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
          d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12C23.98 5.38 18.62.02 12 0zm4.95 15.536l-1.414 1.414L12 13.414 8.464 16.95 7.05 15.536 10.586 12 7.05 8.464 8.464 7.05 12 10.586l3.536-3.536 1.414 1.414L13.414 12l3.536 3.536z"
        />
      </g>
    </svg>
  );
}
export default SvgIcClear;
