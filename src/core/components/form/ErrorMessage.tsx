import { ErrorMessage } from "formik";
import React from "react";

export const ErrorMessageWrapper: React.FC<{ name: string }> = ({ name }) => (
  <ErrorMessage name={name}>
    {(msg) => (
      <div className="error-text">
        <strong>{msg}</strong>
      </div>
    )}
  </ErrorMessage>
);
