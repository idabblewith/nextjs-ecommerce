"use server";
import { RegisterSchema } from "@/types/register-schema";
import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import bcrypt from "bcrypt";
import { db } from "..";
import { eq } from "drizzle-orm";
import { users } from "../schema";
import { generateEmailVerificationToken } from "./tokens";
import { sendVerificationEmail } from "./email";
import { APIResponseType } from "@/types/response-type";

// Create a safe action client
const actionClient = createSafeActionClient();

export const emailRegister = async (input: {
	email: string;
	password: string;
	username: string;
}): Promise<
	SafeActionResult<
		string, // ServerError
		typeof RegisterSchema, // Schema (your validation schema)
		[], // BindArgsSchemas (empty array)
		unknown, // ValidationErrors (default)
		unknown, // BindArgsValidationErrors (default)
		APIResponseType, // Data (your response structure)
		object // NextCtx (default)
	>
> => {
	const result = await actionClient.schema(RegisterSchema).action(
		async ({
			parsedInput,
		}: {
			parsedInput: {
				email: string;
				password: string;
				username: string;
			};
		}) => {
			const { email, password, username } = parsedInput;

			// Hash the password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Check for existing user
			const existingUser = await db.query.users.findFirst({
				where: eq(users.email, email),
			});

			if (existingUser) {
				if (!existingUser.emailVerified) {
					const verificationToken =
						await generateEmailVerificationToken(email);
					await sendVerificationEmail(
						verificationToken[0].email,
						verificationToken[0].token
					);

					return { success: "Email Confirmation resent" };
				}
				return { error: "Email already in use" };
			}

			// Insert new user
			await db.insert(users).values({
				email,
				username,
				password: hashedPassword,
			});

			const verificationToken = await generateEmailVerificationToken(
				email
			);

			await sendVerificationEmail(
				verificationToken[0].email,
				verificationToken[0].token
			);

			return { success: "Confirmation Email Sent!" };
		}
	)(input);

	if (!result) {
		return {
			data: { error: "Something went wrong. Please try again later." },
		};
	}

	return result as SafeActionResult<
		string, // ServerError
		typeof RegisterSchema, // Schema (your validation schema)
		[], // BindArgsSchemas (empty array)
		unknown, // ValidationErrors (default)
		unknown, // BindArgsValidationErrors (default)
		APIResponseType, // Data (your response structure)
		object // NextCtx (default)
	>;
};

export default emailRegister;
