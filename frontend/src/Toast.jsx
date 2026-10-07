import { useEffect, useState } from "react";
import "./Toast.css";

export default function Toast({ message, type = "error", duration = 5000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className={`toast toast-${type} ${visible ? "toast-visible" : ""}`}>
      <div className="toast-content">
        {type === "error" && (
          <svg className="toast-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        )}
        {type === "success" && (
          <svg className="toast-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        )}
        <span className="toast-message">{message}</span>
        <button
          className="toast-close"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
