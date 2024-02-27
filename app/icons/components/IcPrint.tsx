import * as React from "react";
function SvgIcPrint(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h24v24H0z" />
        <path
          fill="currentColor"
          d="M21.284 6.864c.96 0 1.8.84 1.8 1.872v8.784c0 1.008-.84 1.848-1.8 1.848H19.46l.816 3.672H3.692l.648-3.672H2.372c-1.08 0-1.872-.84-1.872-1.848V8.736c0-1.032.792-1.872 1.872-1.872h2.304V4.056h.816V.96H18.14v3.096h.816v2.808h2.328zM6.332 2.088v7.008H17.3V2.088H6.332zM3.62 11.424c.72 0 1.32-.576 1.32-1.296 0-.672-.6-1.272-1.32-1.272-.696 0-1.296.6-1.296 1.272 0 .72.6 1.296 1.296 1.296zm1.512 10.512H18.74l-1.128-5.808H5.996l-.864 5.808zm6.048-2.712H7.844v-.84h3.336v.84zm4.752 0h-3.336v-.84h3.336v.84z"
        />
      </g>
    </svg>
  );
}
export default SvgIcPrint;
