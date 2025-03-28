import * as React from "react";
function SvgIcShow(props: React.SVGProps<SVGSVGElement>) {
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
        d="M10.464 10.3a2.292 2.292 0 112.547 3.812 2.292 2.292 0 01-2.547-3.812zm.417 3.188a1.541 1.541 0 101.712-2.563 1.541 1.541 0 00-1.712 2.563z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.36 8.402a8.266 8.266 0 013.05 3.748l.058.142-.058.142a8.265 8.265 0 01-7.674 5.149h-.002a8.266 8.266 0 01-7.676-5.149L4 12.292l.058-.142A8.267 8.267 0 0111.734 7h.002a8.266 8.266 0 014.624 1.402zm-1.413 7.1a4.546 4.546 0 001.33-3.21 4.546 4.546 0 00-4.54-4.542h-.001a4.542 4.542 0 100 9.084l.002-.001a4.546 4.546 0 003.209-1.332zM4.813 12.294a7.523 7.523 0 012.866-3.357 5.179 5.179 0 000 6.715 7.521 7.521 0 01-2.867-3.358zm12.211 0c0 1.23-.437 2.42-1.235 3.356a7.519 7.519 0 002.865-3.356 7.521 7.521 0 00-2.865-3.357 5.179 5.179 0 011.235 3.356z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcShow;
