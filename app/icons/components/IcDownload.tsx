import * as React from "react";
function SvgIcDownload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4 14v6h16v-6h2v8H2v-8h2zm9-12v10.585l4-4L18.414 10 12 16.414 5.586 10 7 8.586l4 3.999V2h2z"
      />
    </svg>
  );
}
export default SvgIcDownload;
