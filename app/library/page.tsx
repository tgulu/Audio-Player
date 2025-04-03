import { useCallback, useEffect, useState } from "react";
import { AudioFile, UserData } from "../storage/user-data";
import Link from "next/link";

export default function LibraryPage() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Audio Library</h1>
          <Link href="/">Back to Player</Link>
        </div>
        {/* Content to follow */}
      </div>
    </main>
  );
}
