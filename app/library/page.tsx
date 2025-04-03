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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Audio Library</h1>
          <Link href="/">Back to Player</Link>
        </div>
        <div className="mb-8">
          <label className="block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white  text-center transition-colors">
            Upload Audio File
            <input
              type="file"
              accept="audio/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
          {uploadStatus && (
            <p className="mt-2 text-center text-sm text-gray-600">
              {uploadStatus}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
