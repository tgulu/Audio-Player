"use client";

import styles from "../page.module.css";
import { useLibrary } from "../hooks/useLibrary";
import { UploadSection } from "./UploadSection";

export default function LibraryManager() {
  const {
    files,
    isLoading,
    uploadStatus,
    handleDelete,
    handleFileSelect,
    handleRename,
    editingId,
    editingName,
    startEditing,
  } = useLibrary();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className="max-w-4xl mx-auto">
          <UploadSection
            onFileSelect={handleFileSelect}
            uploadStatus={uploadStatus}
          />
        </div>
      </main>
    </div>
  );
}
