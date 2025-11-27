"use client";

import { FC } from "react";
import { FilePicker } from "./FilePicker";
import styles from "../library.module.css";

type UploadSectionProps = {
  onFileSelect: (file: File) => void;
  uploadStatus: string;
};

// Upload section component for handling audio file uploads
export const UploadSection: FC<UploadSectionProps> = ({
  onFileSelect,
  uploadStatus,
}) => {
  return (
    <div className={styles.uploadSection}>
      <FilePicker onFileSelect={onFileSelect}>
        <button className={styles.uploadButton}>Upload Audio File</button>
      </FilePicker>

      {/* Display upload status message, e.g. "Uploading...", "Upload complete!" */}
      {uploadStatus && <p className={styles.uploadStatus}>{uploadStatus}</p>}
    </div>
  );
};
