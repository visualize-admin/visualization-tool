import * as React from "react";
function SvgIcFile(props: React.SVGProps<SVGSVGElement>) {
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
        d="M9.155 4v.017L5.024 9.703H5v10.88h13.519V4H9.155zm.003 1.29V9.7H5.953l3.205-4.41zM5.75 19.833h12.019V4.75H9.905v5.703H5.75v9.38z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcFile;
