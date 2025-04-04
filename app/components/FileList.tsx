"use client";

import { FC } from "react";
import { AudioFile } from "../storage/user-data";
import styles from "../page.module.css";

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
  if (files.length === 0) {
    return <p className="text-center text-gray-600">No files in library</p>;
  }
  return (
    <ul>
      {files.map((file) => (
        <li key={file.id}>
          <div>
            {editingId === file.id ? (
              <input
                type="text"
                value={editingName}
                onChange={(e) => onEditNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onRename(file.id, editingName);
                  if (e.key === "Escape") onCancelEdit();
                }}
                autoFocus
              />
            ) : (
              <div>
                <span>{file.name}</span>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>

          <div>
            {editingId === file.id ? (
              <>
                <button
                  onClick={() => onRename(file.id, editingName)}
                  className={styles.primary}
                >
                  Save
                </button>

                <button onClick={onCancelEdit} className={styles.secondary}>
                  Cancel
                </button>
              </>
            ) : (
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
