import { NextRequest, NextResponse } from "next/server";
import {
  getDataForCurrentUser,
  updateDataForCurrentUser,
} from "../../storage/user-data";

export async function GET() {
  try {
    const userData = await getDataForCurrentUser();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
