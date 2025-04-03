import { NextRequest, NextResponse } from "next/server";
import {
  getDataForCurrentUser,
  updateDataForCurrentUser,
} from "../../storage/user-data-server";
import { USER_DATA, UserData } from "../../storage/user-data";

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
    const body = await request.json();
    console.log("Received update request with body:", body);

    // Validate the incoming data
    if (!body.audioPlaybackSettings) {
      throw new Error("Missing audioPlaybackSettings in request body");
    }

    // Update the user data with the provided data
    const updatedData = await updateDataForCurrentUser((current: UserData) => {
      const newData = {
        ...current,
        audioPlaybackSettings: {
          ...current.audioPlaybackSettings,
          ...body.audioPlaybackSettings,
        },
      };
      console.log("Preparing to update with:", newData);
      return newData;
    });

    console.log("Successfully updated user data:", updatedData);
    return NextResponse.json(updatedData);
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
