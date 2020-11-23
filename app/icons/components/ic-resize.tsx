import * as React from "react";

function SvgIcResize(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h64v64H0z" />
        <path
          d="M63 5v54H1V5h62zm-2 16H3v36h58V21zm0-14H3v12h58V7zM17.3 38.285l5.993-5.992a1 1 0 011.497 1.32l-.083.094L20.415 38h23.17l-4.292-4.293a1 1 0 01-.083-1.32l.083-.094a1 1 0 011.32-.083l.094.083L47.414 39l-6.707 6.707a1 1 0 01-1.497-1.32l.083-.094L43.585 40h-23.17l4.292 4.293a1 1 0 01.083 1.32l-.083.094a1 1 0 01-1.32.083l-.094-.083L16.586 39l6.707-6.707-5.993 5.992zm-2.007-25.992a1 1 0 111.414 1.414 1 1 0 01-1.414-1.414zm-4 0a1 1 0 111.414 1.414 1 1 0 01-1.414-1.414zm-4 0a1 1 0 111.414 1.414 1 1 0 01-1.414-1.414z"
          fill="#757575"
        />
      </g>
    </svg>
  );
}

export default SvgIcResize;
