"use client";
import { ChangeEventHandler, FC, useCallback, ReactNode } from "react";

type FilePickerProps = {
  onFileSelect: (file: File) => void;
  children?: ReactNode;
};

export const FilePicker: FC<FilePickerProps> = ({ onFileSelect, children }) => {
  const onChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <input
        type="file"
        onChange={onChange}
        accept="audio/*"
        style={{
          position: "absolute",
          opacity: 0,
          width: "100%",
          height: "100%",
          cursor: "pointer",
          zIndex: 1,
        }}
      />
      {children}
    </div>
  );
};
