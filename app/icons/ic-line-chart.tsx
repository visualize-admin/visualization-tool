import * as React from "react";

export const icLineChart = ({ size = 48, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill={color}
    fill-rule="evenodd"
    stroke="none"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <g id="chart" transform="translate(3.000000, 6.000000)" fill="#006699">
        <g opacity="0.5" transform="translate(0.534413, 19.639098)">
            <polygon points="14.7727268 12.7524415 2.93117397 1.0658141e-14 -2.48689958e-14 2.7218044 14.1584472 17.9693629 26.9289199 9.45571441 39.1614726 11.3376456 39.7697014 7.3841588 26.002254 5.26608998"></polygon>
        </g>
        <polygon points="38.3786415 0.829018892 26.373946 17.450905 14.4014916 11.4646778 1.4 28.8 4.6 31.2 15.5985084 16.5353222 27.626054 22.549095 41.6213585 3.17098111"></polygon>
    </g>
  </svg>
);