import * as React from "react";
function SvgIcBalance(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M12.723 9.249a2.287 2.287 0 001.879-1.879h2.475l-1.738 4.88-.022.126a2.292 2.292 0 104.583 0L18.14 7.37h.267v-.75h-3.805a2.284 2.284 0 00-4.508 0H6.343v.75h.267l-1.739 4.88-.021.126a2.292 2.292 0 104.584 0L7.673 7.37h2.42a2.287 2.287 0 001.88 1.879v9.903H5.208v.75h14.3v-.75h-6.785V9.25zm6.426 3.188a1.542 1.542 0 01-3.08 0l1.54-4.324 1.54 4.325zm-10.466 0a1.542 1.542 0 01-3.082 0l1.54-4.325 1.542 4.325zm2.123-5.442a1.542 1.542 0 113.084 0 1.542 1.542 0 01-3.084 0z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcBalance;
