import * as React from "react";
function SvgIcFormatting(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4.337 20A9.69 9.69 0 014 19.994l.015-.78c.24 0 .738-.83.74-1.344.025-.2.04-.4.044-.6.037-.945.082-2.118 2.23-3.064L17.55 4 20 6.38 9.56 16.51a2.66 2.66 0 01-.151 1.126 2.727 2.727 0 01-.61.97C7.6 19.844 5.375 20 4.337 20zm2.839-4.997c-.494.15-.92.461-1.205.88a2.13 2.13 0 00-.365 1.416c-.004.21-.02.42-.047.63a2.68 2.68 0 01-.423 1.26 4.97 4.97 0 003.074-1.117c.198-.204.35-.447.442-.712a1.91 1.91 0 00.1-.825l-1.576-1.532zm.656-.47l1.31 1.274L18.86 6.38l-1.31-1.273-9.718 9.427z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcFormatting;
