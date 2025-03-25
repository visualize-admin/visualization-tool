import * as React from "react";
function SvgIcStar(props: React.SVGProps<SVGSVGElement>) {
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
        d="M7.197 19.92l5.173-2.719 5.172 2.72-.987-5.76 4.185-4.08-5.784-.84L12.37 4 9.783 9.24 4 10.081l4.185 4.08-.988 5.76zm9.348-1.37l-4.177-2.197L8.19 18.55l.797-4.652-3.379-3.293 4.67-.68 2.089-4.23 2.088 4.23 4.67.68-3.379 3.293.797 4.652z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcStar;
