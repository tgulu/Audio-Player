import { v4 as uuidv4 } from "uuid";

/*
 * This module exposes some functions to handle authentication.
 *
 * The decisions made here don't reflect good security practices,
 * but are good enough for the purpose of this challenge.
 */

/**
 * Assume the user is a new user,
 * and generate a new token that uniquely identifies them.
 */
export const generateTokenForNewUser = () => {
  // Note, UUIDs don't have enough entropy to be used as a secure token.
  // In a real application, you would use a secure random generator.
  // But for this challenge, it's good enough.
  return uuidv4();
};

export function getUserIdFromToken(token: string): string {
  // For this example, we'll just use the token as the user ID
  // In a real app, you would validate the JWT and extract the user ID
  return token;
}
