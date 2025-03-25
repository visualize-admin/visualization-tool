import * as React from "react";
function SvgIcSize(props: React.SVGProps<SVGSVGElement>) {
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
        d="M18.156 12.001l-3.102 4.154-.916-.409 2.478-3.314h-9.23l2.475 3.313-.915.407L5.844 12l3.102-4.154.916.409-2.482 3.32h9.238l-2.48-3.319.916-.407 3.102 4.153zM4 18V6H3v12h1zm17 0V6h-1v12h1z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcSize;
