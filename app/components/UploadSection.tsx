import { FilePicker } from "./FilePicker";

interface Props {
  onFileSelect: (file: File) => void;
  uploadStatus: string;
}

export function UploadSection({ onFileSelect, uploadStatus }: Props) {
  return (
    <div className="mb-8">
      <FilePicker onFileSelect={onFileSelect} />
      <span>Upload Audio File</span>
      {uploadStatus && (
        <p className="mt-2 text-center text-sm text-white">{uploadStatus}</p>
      )}
    </div>
  );
}
