import * as React from "react";
function SvgIcFreeCanvas(props: React.SVGProps<SVGSVGElement>) {
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
        d="M12 11l10 2.727-3.423 1.711 2.743 2.743-2.139 2.14-2.742-2.744L14.727 21 12 11zm1.41 1.41L15 18.241l1.168-2.334 3.013 3.014.74-.74-3.014-3.014L19.241 14l-5.83-1.59zM4 4.778V3h1.778v.941H4.94v.837H4zM11.111 3H7.556v.941h3.555V3zm1.778 0v.941h3.555V3H12.89zm5.333 0v.941h.837v.837H20V3h-1.778zM20 6.556h-.941v3.555H20V6.556zM11.111 19v-.941H7.556V19h3.555zm-5.333 0v-.941H4.94v-.837H4V19h1.778zM4 15.444h.941V11.89H4v3.555zm0-5.333h.941V6.556H4v3.555z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcFreeCanvas;
