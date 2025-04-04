"use client";

import { FC } from "react";
import { FilePicker } from "./FilePicker";
import styles from "../page.module.css";

type UploadSectionProps = {
  onFileSelect: (file: File) => void;
  uploadStatus: string;
  // isUploading?: boolean;
};

export const UploadSection: FC<UploadSectionProps> = ({
  onFileSelect,
  uploadStatus,
  // isUploading = false,
}) => {
  return (
    <>
      <div className={styles.ctas}>
        <div className={styles.primary}>
          <FilePicker onFileSelect={onFileSelect} />
          {uploadStatus !== "Uploading..." && <span>Upload Audio File</span>}
        </div>
      </div>

      {uploadStatus && (
        <p className="text-center text-gray-600">{uploadStatus}</p>
      )}
    </>
  );
};
