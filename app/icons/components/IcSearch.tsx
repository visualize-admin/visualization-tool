import * as React from "react";
function SvgIcSearch(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12.799 5.299c2.2 1.9 2.4 5.3.5 7.5l5.9 6-.5.5-6-6c-2 1.7-4.9 1.7-6.9 0-2.2-1.9-2.4-5.3-.5-7.5s5.3-2.4 7.5-.5zM4.797 9.297c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5-2-4.5-4.5-4.5-4.5 2-4.5 4.5z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcSearch;
