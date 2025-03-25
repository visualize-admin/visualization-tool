import * as React from "react";
function SvgIcBookmark(props: React.SVGProps<SVGSVGElement>) {
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
        d="M5 4v16.803l6.776-3.912 6.743 3.893V4H5zm.75 15.504V4.75h12.019v14.735l-5.993-3.46-6.026 3.479z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcBookmark;
