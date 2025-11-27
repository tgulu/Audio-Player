import { NextRequest, NextResponse } from "next/server";
import {
  getDataForCurrentUser,
  updateDataForCurrentUser,
} from "../../storage/user-data-server";
import { UserData } from "../../storage/user-data";

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

      // Convert file to base64 for storage (works on serverless platforms)
      const buffer = await file.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString("base64");
      const fileName = `${Date.now()}-${file.name}`;

      // Update user data with new file (including base64 data)
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
              data: base64Data, // Store file data as base64
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
              // Remove file from library (no filesystem operation needed)
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
