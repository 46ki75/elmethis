import { component$ } from "@builder.io/qwik";
import type { CommonLanguageProps } from "./language-interface";

export const Json = component$<CommonLanguageProps>(
  ({ size = 24, ...props }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 128 128"
        {...props}
      >
        <linearGradient
          id="deviconJson0"
          x1="-670.564"
          x2="-583.105"
          y1="-280.831"
          y2="-368.306"
          gradientTransform="matrix(.9988 0 0 -.9987 689.011 -259.008)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <path
          fill="url(#deviconJson0)"
          fillRule="evenodd"
          d="M63.895 94.303c27.433 37.398 54.281-10.438 54.241-39.205c-.046-34.012-34.518-53.021-54.263-53.021C32.182 2.077 2 28.269 2 64.105C2 103.937 36.596 126 63.873 126c-6.172-.889-26.742-5.296-27.019-52.674c-.186-32.044 10.453-44.846 26.974-39.214c.37.137 18.223 7.18 18.223 30.187c0 22.908-18.156 30.004-18.156 30.004"
          clipRule="evenodd"
        />
        <linearGradient
          id="deviconJson1"
          x1="-579.148"
          x2="-666.607"
          y1="-364.34"
          y2="-276.865"
          gradientTransform="matrix(.9988 0 0 -.9987 689.011 -259.008)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <path
          fill="url(#deviconJson1)"
          fillRule="evenodd"
          d="M63.895 94.303c27.433 37.398 54.281-10.438 54.241-39.205c-.046-34.012-34.518-53.021-54.263-53.021C32.182 2.077 2 28.269 2 64.105C2 103.937 36.596 126 63.873 126c-6.172-.889-26.742-5.296-27.019-52.674c-.186-32.044 10.453-44.846 26.974-39.214c.37.137 18.223 7.18 18.223 30.187c0 22.908-18.156 30.004-18.156 30.004"
          clipRule="evenodd"
        />
      </svg>
    );
  },
);
