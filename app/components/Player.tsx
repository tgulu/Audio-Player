"use client";
import { FC, useCallback, useEffect, useState } from "react";
import { FilePicker } from "./FilePicker";
import { readFile, base64ToFile } from "../util";
import { AudioContextContext } from "./AudioContextProvider";
import { PlayerPlayback } from "./PlayerPlayback";
import styles from "../player.module.css";
import Link from "next/link";

export const Player: FC = () => {
  const [context, setContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  useEffect(() => {
    const context = new AudioContext();
    setContext(context);
    return () => {
      context.close();
    };
  }, []);

  // Check for files from library on mount
  useEffect(() => {
    const loadFileFromLibrary = async () => {
      const storedFile = sessionStorage.getItem("selectedAudioFile");
      if (storedFile && context) {
        try {
          const fileData = JSON.parse(storedFile);
          const audioFile = base64ToFile(fileData.data, fileData.name);
          setCurrentFile(audioFile);
          const bytes = await readFile(audioFile);
          const buffer = await context.decodeAudioData(bytes);
          setAudioBuffer(buffer);
          // Clear the stored file
          sessionStorage.removeItem("selectedAudioFile");
        } catch (error) {
          console.error("Error loading file from library:", error);
        }
      }
    };

    loadFileFromLibrary();
  }, [context]);

  const onFileSelect = useCallback(
    async (file: File) => {
      if (context) {
        setCurrentFile(file);
        const bytes = await readFile(file);
        const buffer = await context.decodeAudioData(bytes);
        setAudioBuffer(buffer);
      }
    },
    [context]
  );

  if (!context) {
    return null;
  }

  return (
    <div className={styles.playerContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.backButton}>
            ← Back to Home
          </Link>
          <h1 className={styles.pageTitle}>Audio Player</h1>
        </div>
      </header>

      <main className={styles.mainContent}>
        {!audioBuffer ? (
          <div className={styles.fileUploadSection}>
            <FilePicker onFileSelect={onFileSelect}>
              <button className={styles.uploadButton}>
                <span>🎛️</span>
                Choose Audio File
              </button>
            </FilePicker>
            <div className={styles.noFileMessage}>
              <div className={styles.noFileIcon}>🎧</div>
              <h3 className={styles.noFileTitle}>No Audio File Loaded</h3>
              <p className={styles.noFileText}>
                Select an audio file to start playing
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.currentFileInfo}>
              <div className={styles.fileIcon}>🎛️</div>
              <div className={styles.fileDetails}>
                <h3 className={styles.fileName}>{currentFile?.name}</h3>
                <p className={styles.fileMeta}>
                  {currentFile &&
                    `${(currentFile.size / 1024 / 1024).toFixed(2)} MB`}
                </p>
              </div>
            </div>
            <AudioContextContext.Provider value={context}>
              <PlayerPlayback context={context} audioBuffer={audioBuffer} />
            </AudioContextContext.Provider>
          </>
        )}
      </main>
    </div>
  );
};
