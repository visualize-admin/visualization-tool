import * as React from "react";
function SvgIcEnvelope(props: React.SVGProps<SVGSVGElement>) {
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
        d="M4.086 4.617v13.52h16.583V4.616H4.086zm15.43.75l-7.139 4.12-7.137-4.12h14.275zm-14.68 12.02V6l7.541 4.354L19.92 6v11.386H4.836z"
        fill="currentColor"
      />
    </svg>
  );
}
export default SvgIcEnvelope;
