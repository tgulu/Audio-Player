// This is a server-side version of user-data.ts

import { cookies } from "next/headers";
import { z } from "zod";
import { TOKEN_COOKIE } from "../constants";
import { getUserIdFromToken } from "../auth";
import path from "path";
import { USER_DATA_DIR } from "./constants";
import { readFile, mkdir, writeFile } from "fs/promises";
import { USER_DATA, DEFAULT_DATA, UserData } from "./user-data";

// Server-side functions
export const getUserId = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE);
  if (!token) {
    throw new Error("No token found");
  }
  return getUserIdFromToken(token.value);
};

const getFilePath = (userId: string) => {
  return path.join(USER_DATA_DIR, `${userId}.json`);
};

export const getDataForCurrentUser = async () => {
  console.log("Getting data for current user");
  const userId = await getUserId();
  const filePath = getFilePath(userId);
  try {
    const json = await readFile(filePath, "utf-8");
    console.log("Read file contents:", json);
    const parsed = USER_DATA.parse(JSON.parse(json));
    console.log("Parsed data:", parsed);
    return parsed;
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "ENOENT") {
      console.log("No existing file found, returning default data");
      return DEFAULT_DATA;
    }
    console.error("Error reading user data:", e);
    return DEFAULT_DATA;
  }
};

export const updateDataForCurrentUser = async (
  update: (current: UserData) => UserData | Promise<UserData>
): Promise<UserData> => {
  console.log("Updating data for current user");
  const current = await getDataForCurrentUser();
  console.log("Current data:", current);

  const userId = await getUserId();
  const filePath = getFilePath(userId);

  const updated = await update(current);
  console.log("Updated data:", updated);

  // Ensure the directory exists
  await mkdir(USER_DATA_DIR, { recursive: true });

  // Validate the updated data against our schema
  const validatedData = USER_DATA.parse(updated);
  console.log("Validated data:", validatedData);

  // Write the validated data to file
  await writeFile(filePath, JSON.stringify(validatedData, null, 2), "utf-8");

  return validatedData;
};
