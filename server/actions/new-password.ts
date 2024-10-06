"use server";

import { NewPasswordSchema } from "@/types/new-password-schema";
import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import { getPasswordResetTokenByToken } from "./tokens";
import { db } from "..";
import { eq } from "drizzle-orm";
import { passwordResetTokens, users } from "../schema";
import bcrypt from "bcrypt";
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { APIResponseType } from "@/types/response-type";

// Create a safe action client
const actionClient = createSafeActionClient();

export const newPassword = async (input: {
	password: string;
	token?: string | null;
}): Promise<
	SafeActionResult<
		string, // ServerError
		typeof NewPasswordSchema, // Schema
		[], // BindArgsSchemas
		unknown, // ValidationErrors
		unknown, // BindArgsValidationErrors
		APIResponseType, // Data (response structure)
		object // NextCtx
	>
> => {
	const result = await actionClient
		.schema(NewPasswordSchema)
		.action(
			async ({
				parsedInput,
			}: {
				parsedInput: { password: string; token?: string | null };
			}) => {
				const { password, token } = parsedInput;

				const pool = new Pool({
					connectionString: process.env.DATABASE_URL,
				});
				const dbPool = drizzle(pool);

				// Check for missing token
				if (!token) {
					return { error: "Missing Token" }; // Use 'data' in SafeActionResult
				}

				// Check if the token is valid
				const existingToken = await getPasswordResetTokenByToken(token);
				if (!existingToken) {
					return { error: "Token not found" }; // Use 'data' in SafeActionResult
				}

				const hasExpired = new Date(existingToken.expires) < new Date();
				if (hasExpired) {
					return { error: "Token has expired" }; // Use 'data' in SafeActionResult
				}

				// Check if the user exists
				const existingUser = await db.query.users.findFirst({
					where: eq(users.email, existingToken.email),
				});

				if (!existingUser) {
					return { error: "User not found" }; // Use 'data' in SafeActionResult
				}

				// Hash the new password and update the user's password
				const hashedPassword = await bcrypt.hash(password, 10);

				await dbPool.transaction(async (tx) => {
					await tx
						.update(users)
						.set({
							password: hashedPassword,
						})
						.where(eq(users.id, existingUser.id));
					await tx
						.delete(passwordResetTokens)
						.where(eq(passwordResetTokens.id, existingToken.id));
				});

				return { success: "Password updated" }; // Use 'data' in SafeActionResult
			}
		)(input);

	if (!result) {
		return { serverError: "An unexpected error occurred." }; // Proper error structure
	}

	return result as SafeActionResult<
		string,
		typeof NewPasswordSchema,
		[],
		unknown,
		unknown,
		APIResponseType,
		object
	>;
};
