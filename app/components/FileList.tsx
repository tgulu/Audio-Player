"use client";

import { FC } from "react";
import { AudioFile } from "../storage/user-data";
import styles from "../page.module.css";

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
}) => {
  // If there are no files to show, display a fallback message
  if (files.length === 0) {
    return <p className="text-center text-gray-600">No files in library</p>;
  }

  return (
    <ul>
      {files.map((file) => (
        <li key={file.id}>
          <div>
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
              />
            ) : (
              // Display file name and size when not editing
              <div>
                <span>{file.name} &nbsp;</span>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>

          <div>
            {editingId === file.id ? (
              // Show Save/Cancel buttons during editing
              <>
                <button
                  onClick={() => {
                    onRename(file.id, editingName); // Save the new name
                    onCancelEdit(); // Reset editing state
                  }}
                >
                  Save
                </button>

                <button onClick={onCancelEdit} className={styles.secondary}>
                  Cancel
                </button>
              </>
            ) : (
              // Show Rename/Delete buttons when not editing
              <>
                <button
                  onClick={() => onStartEditing(file)}
                  className={styles.primary}
                >
                  Rename
                </button>
                <button
                  onClick={() => onDelete(file.id)}
                  className={styles.secondary}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};
