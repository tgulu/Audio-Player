import { NextRequest, NextResponse } from "next/server";
import {
  getDataForCurrentUser,
  updateDataForCurrentUser,
} from "../../storage/user-data-server";
import { USER_DATA, UserData } from "../../storage/user-data";
import fs from "fs/promises";
import path from "path";

type AudioPlaybackSettings = {
  playbackRate: number;
  filterType: "none" | "highpass" | "lowpass";
  highpassFrequency: number;
  lowpassFrequency: number;
};

// Helper to ensure audio directory exists
const ensureAudioDir = async () => {
  const audioDir = path.join(process.cwd(), "data", "audio");
  try {
    await fs.access(audioDir);
  } catch {
    await fs.mkdir(audioDir, { recursive: true });
  }
  return audioDir;
};

export async function GET() {
  console.log("GET /api/user-data - Fetching user data");
  try {
    const userData = await getDataForCurrentUser();
    console.log("Successfully fetched user data:", userData);
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log("POST /api/user-data - Updating user data");
  try {
    // Handle file upload
    if (request.headers.get("Content-Type")?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) throw new Error("No file provided");

      const buffer = await file.arrayBuffer();
      const fileName = `${Date.now()}-${file.name}`;

      // Save file to data/audio directory
      const audioDir = await ensureAudioDir();
      await fs.writeFile(path.join(audioDir, fileName), Buffer.from(buffer));

      // Update user data with new file
      const updatedData = await updateDataForCurrentUser(
        (current: UserData) => ({
          ...current,
          library: [
            ...(current.library || []),
            {
              id: fileName,
              name: file.name,
              originalName: file.name,
              uploadedAt: new Date().toISOString(),
              size: file.size,
            },
          ],
        })
      );

      return NextResponse.json(updatedData);
    }

    const body = await request.json();
    console.log("Received update request with body:", body);

    // Handle audio settings update
    if (body.audioPlaybackSettings) {
      const updatedData = await updateDataForCurrentUser(
        (current: UserData) => {
          const newSettings = {
            ...current.audioPlaybackSettings,
            ...body.audioPlaybackSettings,
            highpassFrequency:
              body.audioPlaybackSettings.highpassFrequency ??
              current.audioPlaybackSettings?.highpassFrequency ??
              1000,
            lowpassFrequency:
              body.audioPlaybackSettings.lowpassFrequency ??
              current.audioPlaybackSettings?.lowpassFrequency ??
              1000,
          };

          return {
            ...current,
            audioPlaybackSettings: newSettings,
          };
        }
      );

      console.log("Successfully updated user data:", updatedData);
      return NextResponse.json(updatedData);
    }

    // Handle library operations
    if (body.operation) {
      const updatedData = await updateDataForCurrentUser(
        (current: UserData) => {
          let newLibrary = [...(current.library || [])];

          switch (body.operation) {
            case "delete":
              // Delete file from disk
              const filePath = path.join(
                process.cwd(),
                "data",
                "audio",
                body.fileId
              );
              fs.unlink(filePath).catch(console.error);
              newLibrary = newLibrary.filter((file) => file.id !== body.fileId);
              break;

            case "rename":
              newLibrary = newLibrary.map((file) =>
                file.id === body.fileId ? { ...file, name: body.newName } : file
              );
              break;
          }

          return {
            ...current,
            library: newLibrary,
          };
        }
      );

      return NextResponse.json(updatedData);
    }

    throw new Error("Invalid request body");
  } catch (error) {
    console.error("Error updating user data:", error);
    return NextResponse.json(
      {
        error: "Failed to update user data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
