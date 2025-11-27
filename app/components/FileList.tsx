"use client";

import { FC } from "react";
import { AudioFile } from "../storage/user-data";
import styles from "../library.module.css";

// Props type for the FileList component
type FileListProps = {
  files: AudioFile[];
  editingId: string | null;
  editingName: string;
  onEditNameChange: (name: string) => void;
  onRename: (fileId: string, newName: string) => void;
  onCancelEdit: () => void;
  onStartEditing: (file: AudioFile) => void;
  onDelete: (fileId: string) => void;
  onPlay?: (file: AudioFile) => void; // New prop for playing files
};

// Renders a list of audio files with support for renaming and deleting
export const FileList: FC<FileListProps> = ({
  files,
  editingId,
  editingName,
  onEditNameChange,
  onRename,
  onCancelEdit,
  onStartEditing,
  onDelete,
  onPlay,
}) => {
  // If there are no files to show, display a fallback message
  if (files.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>🎛️</div>
        <h3 className={styles.emptyStateTitle}>Your library is empty</h3>
        <p className={styles.emptyStateText}>
          Upload your first audio file to get started
        </p>
      </div>
    );
  }

  return (
    <ul className={styles.fileList}>
      {files.map((file) => (
        <li key={file.id} className={styles.fileItem}>
          <div className={styles.fileContent}>
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon}>🎧</div>
              <div className={styles.fileDetails}>
                {editingId === file.id ? (
                  // Input field shown when editing this file's name
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => onEditNameChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onRename(file.id, editingName); // Save the new name
                        onCancelEdit(); // Reset editing state
                      }
                      if (e.key === "Escape") onCancelEdit();
                    }}
                    autoFocus
                    className={styles.editInput}
                    placeholder="Enter new name..."
                  />
                ) : (
                  // Display file name and size when not editing
                  <>
                    <h3 className={styles.fileName}>{file.name}</h3>
                    <p className={styles.fileMeta}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB •
                      {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className={styles.fileActions}>
              {editingId === file.id ? (
                // Show Save/Cancel buttons during editing
                <>
                  <button
                    onClick={() => {
                      onRename(file.id, editingName); // Save the new name
                      onCancelEdit(); // Reset editing state
                    }}
                    className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                  >
                    Save
                  </button>

                  <button
                    onClick={onCancelEdit}
                    className={styles.actionButton}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                // Show Rename/Delete buttons when not editing
                <>
                  {onPlay && (
                    <button
                      onClick={() => onPlay(file)}
                      className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                    >
                      ▶️ Play
                    </button>
                  )}
                  <button
                    onClick={() => onStartEditing(file)}
                    className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => onDelete(file.id)}
                    className={`${styles.actionButton} ${styles.actionButtonDanger}`}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
