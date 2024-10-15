import React from "react";
import "./alert.scss";

interface CustomAlertProps {
  message: string;
  severity: "info" | "warning" | "error";
  onClose?: () => void;
}
// CustomAlert component
export const CustomAlert: React.FC<CustomAlertProps> = ({ message, severity, onClose }) => {
  return (
    <a className={`custom-alert ${severity}`}>
      <div className="alert-content">
        {severity === "error" && <span className={`severity-icon ${severity}`}>&#9432;</span>}
        {severity === "warning" && <span className={`severity-icon ${severity}`}>&#x26A0;</span>}
        {severity === "info" && <span className={`severity-icon ${severity}`}>&#9432;</span>}
        <span className="alert-text">{message}</span>
        {onClose && (
          <button onClick={onClose} className="alert-close">
            Close
          </button>
        )}
      </div>
    </a>
  );
};
