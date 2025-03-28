import * as React from "react";
function SvgIcPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 20l14-8L5 4v16zm1-1.723L16.984 12 6 5.723v12.554z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcPlay;
