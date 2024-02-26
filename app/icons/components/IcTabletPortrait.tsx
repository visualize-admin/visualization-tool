import * as React from "react";
function SvgIcTabletPortrait(props: React.SVGProps<SVGSVGElement>) {
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
          d="M18 1a2 2 0 012 2v18a2 2 0 01-2 2H6a2 2 0 01-2-2V3a2 2 0 012-2h12zm-4.5 20h-3a.5.5 0 100 1h3a.5.5 0 100-1zM18 4H6v16h12V4z"
        />
      </g>
    </svg>
  );
}
export default SvgIcTabletPortrait;
