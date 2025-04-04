"use client";

import styles from "../page.module.css";
import { useLibrary } from "../hooks/useLibrary";
import { UploadSection } from "./UploadSection";
import { FileList } from "./FileList";
import Link from "next/link";
export default function LibraryManager() {
  const {
    files,
    isLoading,
    editingId,
    editingName,
    uploadStatus,
    setEditingName,
    handleFileSelect,
    handleDelete,
    handleRename,
    startEditing,
    cancelEditing,
  } = useLibrary();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>
          <div>
            <Link href="/" className={styles.primary}>
              Back to Player
            </Link>
          </div>

          <UploadSection
            onFileSelect={handleFileSelect}
            uploadStatus={uploadStatus}
          />
          {isLoading ? (
            <p>Loading library...</p>
          ) : (
            <FileList
              files={files}
              editingId={editingId}
              editingName={editingName}
              onEditNameChange={setEditingName}
              onCancelEdit={cancelEditing}
              onStartEditing={startEditing}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          )}
        </div>
      </main>
    </div>
  );
}
