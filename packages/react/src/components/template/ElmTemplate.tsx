import React from "react";

type ElmTemplateProps = {
  message: string;
};

const ElmTemplate = ({ message }: ElmTemplateProps) => {
  return <div>ElmTemplate {message}</div>;
};

export default ElmTemplate;
