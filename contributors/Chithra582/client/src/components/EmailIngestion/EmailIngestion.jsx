import React, { useState } from "react";
import Spinner from "../Spinner/Spinner";
import Toast from "../Toast/Toast";
import { ingestEmails } from "../../api/emailApi";
import styles from "./EmailIngestion.module.css";

const EmailIngestion = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const handleIngestEmails = async () => {
    setLoading(true);
    setToast({ message: "", type: "" });

    try {
      const result = await ingestEmails();
      setToast({ message: result, type: "success" });
    } catch (error) {
      setToast({ message: `Ingestion failed: ${error.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles["email-ingestion-container"]}>
      <h2>Email Ingestion</h2>

      <button
        onClick={handleIngestEmails}
        disabled={loading}
        className={`${styles["ingest-btn"]} ${
          loading ? styles.disabled : ""
        }`}
      >
        {loading ? "Ingesting..." : "Start Ingestion"}
      </button>

      {loading && (
        <div className={styles["loading-container"]}>
          <Spinner />
          <span>Processing emails...</span>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "" })}
      />
    </div>
  );
};

export default EmailIngestion;
