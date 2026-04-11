import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import styles from "./ElmTemplate.module.css";
export const ElmTemplate = (props) => {
    return (_jsx("div", { className: styles["elm-template"], style: props.style, children: "PLACEHOLDER" }));
};
