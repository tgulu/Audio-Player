import { useState, useEffect, useCallback } from "react";
import { AudioFile, loadUserLibrary } from "../storage/user-data";

export function useLibrary() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>("");

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

  const handleFileSelect = useCallback(async (file: File) => {
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
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("Upload failed");
    } finally {
      setTimeout(() => setUploadStatus(""), 2000);
    }
  }, []);

  // Handle file rename
  const handleRename = useCallback(async (fileId: string, newName: string) => {
    try {
      const response = await fetch("/api/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: "rename",
          fileId,
          newName: newName.trim(),
        }),
      });

      if (!response.ok) throw new Error("Rename failed");

      const data = await response.json();
      setFiles(data.library || []);
    } catch (error) {
      console.error("Rename error:", error);
    }
  }, []);

  // Start editing a file name
  const startEditing = useCallback((file: AudioFile) => {
    setEditingId(file.id);
    setEditingName(file.name);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  return {
    files,
    isLoading,
    uploadStatus,
    handleDelete,
    handleFileSelect,
    handleRename,
    setUploadStatus,
    editingId,
    editingName,
    startEditing,
    cancelEditing,
  };
}
