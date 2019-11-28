import * as React from "react";

export const IconText = ({ size = 24, color = "currentColor" }) => (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    fillRule="evenodd"
    stroke="none"
    >
    <path
        transform="translate(4 5)"
        d="M4 15L4 13 7 13 7 2 2 2 2 4 0 4 0 0 16 0 16 4 14 4 14 2 9 2 9 13 12 13 12 15z"
    />
    </svg>
);