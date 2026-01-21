import React from "react";
import "./Toast.module.css";

const Toast = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div className={`toast ${bgColor}`}>
      <span>{message}</span>
      <button className="close-btn" onClick={onClose}>X</button>
    </div>
  );
};

export default Toast;
