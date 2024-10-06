"use server";

import { ResetSchema } from "@/types/reset-schema";
import { APIResponseType } from "@/types/response-type";
import { eq } from "drizzle-orm";
import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import { db } from "..";
import { users } from "../schema";
import { generatePasswordResetToken } from "./tokens";
import { sendPasswordResetEmail } from "./email";

// Create a safe action client
const actionClient = createSafeActionClient();

export const reset = async (input: {
	email: string;
}): Promise<
	SafeActionResult<
		string, // ServerError
		typeof ResetSchema, // Schema
		[], // BindArgsSchemas
		unknown, // ValidationErrors
		unknown, // BindArgsValidationErrors
		APIResponseType, // Data (response structure)
		object // NextCtx
	>
> => {
	const result = await actionClient
		.schema(ResetSchema)
		.action(async ({ parsedInput }: { parsedInput: { email: string } }) => {
			const { email } = parsedInput;

			const existingUser = await db.query.users.findFirst({
				where: eq(users.email, email),
			});

			if (!existingUser) {
				return { error: "User not found" };
			}

			const passwordResetToken = await generatePasswordResetToken(email);
			if (!passwordResetToken) {
				return { error: "Token not generated" };
			}
			await sendPasswordResetEmail(
				passwordResetToken[0].email,
				passwordResetToken[0].token
			);
			return { success: "Reset Email Sent" };
		})(input);

	if (!result) {
		return { serverError: "An unexpected error occurred." }; // Proper error structure
	}

	return result as SafeActionResult<
		string,
		typeof ResetSchema,
		[],
		unknown,
		unknown,
		APIResponseType,
		object
	>;
};
