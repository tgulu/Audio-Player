"use client";

import { useCallback, useEffect, useState } from "react";
import { AudioFile, loadUserLibrary } from "../storage/user-data";
import Link from "next/link";
import styles from "../page.module.css";

export default function LibraryPage() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Load library on mount
  useEffect(() => {
    loadUserLibrary()
      .then((data) => {
        setFiles(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load library:", error);
        setIsLoading(false);
      });
  }, []);

  // Handle file upload
  const handleUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploadStatus("Uploading...");
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/user-data", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        setFiles(data.library || []);
        setUploadStatus("Upload complete!");
        setTimeout(() => setUploadStatus(""), 2000);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadStatus("Upload failed");
        setTimeout(() => setUploadStatus(""), 2000);
      }
    },
    []
  );

  // Handle file deletion
  const handleDelete = useCallback(async (fileId: string) => {
    try {
      const response = await fetch("/api/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "delete", fileId }),
      });

      if (!response.ok) throw new Error("Delete failed");

      const data = await response.json();
      setFiles(data.library || []);
    } catch (error) {
      console.error("Delete error:", error);
    }
  }, []);

  // Handle file rename
  const handleRename = useCallback(
    async (fileId: string) => {
      if (!editingName.trim()) {
        setEditingId(null);
        return;
      }

      try {
        const response = await fetch("/api/user-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "rename",
            fileId,
            newName: editingName.trim(),
          }),
        });

        if (!response.ok) throw new Error("Rename failed");

        const data = await response.json();
        setFiles(data.library || []);
        setEditingId(null);
      } catch (error) {
        console.error("Rename error:", error);
      }
    },
    [editingName]
  );

  // Start editing a file name
  const startEditing = useCallback((file: AudioFile) => {
    setEditingId(file.id);
    setEditingName(file.name);
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <Link href="/" className={styles.primary}>
            Back to Player
          </Link>
        </div>

        <div className={styles.ctas}>
          <label className={styles.primary}>
            Upload Audio File
            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {uploadStatus && (
          <p className="text-center text-gray-600">{uploadStatus}</p>
        )}

        {isLoading ? (
          <p className="text-center text-gray-600">Loading library...</p>
        ) : files.length === 0 ? (
          <p className="text-center text-gray-600">No files in library</p>
        ) : (
          <ul className="space-y-4">
            {files.map((file) => (
              <li
                key={file.id}
                className="p-4 bg-white rounded-lg shadow flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  {editingId === file.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(file.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full px-2 py-1 border rounded"
                      autoFocus
                    />
                  ) : (
                    <div className="flex flex-col">
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(file.uploadedAt).toLocaleDateString()} •{" "}
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  {editingId === file.id ? (
                    <>
                      <button
                        onClick={() => handleRename(file.id)}
                        className={styles.primary}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={styles.secondary}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(file)}
                        className={styles.primary}
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(file.id)}
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
        )}
      </main>
    </div>
  );
}
