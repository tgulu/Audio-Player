"use client";

import styles from "../library.module.css";
import { useLibrary } from "../hooks/useLibrary";
import { UploadSection } from "./UploadSection";
import { FileList } from "./FileList";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AudioFile } from "../storage/user-data";
import { base64ToFile } from "../util";

export default function LibraryManager() {
  const router = useRouter();

  // Custom hook manages all state and logic for the audio library
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

  const handlePlay = (file: AudioFile) => {
    // Convert base64 data back to File object
    if (file.data) {
      const audioFile = base64ToFile(file.data, file.name);
      // Store the file in sessionStorage for the player to access
      sessionStorage.setItem(
        "selectedAudioFile",
        JSON.stringify({
          name: file.name,
          size: file.size,
          data: file.data,
        })
      );
      // Navigate to player page
      router.push("/player");
    }
  };

  return (
    <div className={styles.libraryContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backButton}>
            ← Back to Home
          </Link>
          <h1 className={styles.pageTitle}>Your Library</h1>
        </div>
      </header>

      <main className={styles.mainContent}>
        <UploadSection
          onFileSelect={handleFileSelect}
          uploadStatus={uploadStatus}
        />

        {/* Conditionally render the file list or loading state */}
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading your library...</p>
          </div>
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
            onPlay={handlePlay}
          />
        )}
      </main>
    </div>
  );
}
