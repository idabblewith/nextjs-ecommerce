"use server";
import { LoginSchema } from "@/types/login-schema";
import { eq } from "drizzle-orm";
import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import { db } from "..";
import { twoFactorTokens, users } from "../schema";
import { APIResponseType } from "@/types/response-type";
import {
	generateEmailVerificationToken,
	generateTwoFactorToken,
	getTwoFactorTokenByEmail,
} from "./tokens";
import { sendTwoFactorTokenByEmail, sendVerificationEmail } from "./email";
import { signIn } from "../auth";
import { AuthError } from "next-auth";

// Create a safe action client
const actionClient = createSafeActionClient();

export const emailSignIn = async (input: {
	email: string;
	password: string;
	code?: string;
}): Promise<
	SafeActionResult<
		string, // ServerError
		typeof LoginSchema, // Schema
		[], // BindArgsSchemas (empty array)
		unknown, // ValidationErrors (default)
		unknown, // BindArgsValidationErrors (default)
		APIResponseType, // Data (response structure)
		object // NextCtx (default)
	>
> => {
	// Use actionClient to perform the action with validation
	const result = await actionClient
		.schema(LoginSchema)
		.action(
			async ({
				parsedInput,
			}: {
				parsedInput: { email: string; password: string; code?: string };
			}) => {
				const { email, password, code } = parsedInput;

				try {
					const existingUser = await db.query.users.findFirst({
						where: eq(users.email, email),
					});

					// Check if the user exists
					if (!existingUser) {
						return { error: "User not found" };
					}

					if (existingUser?.email !== email) {
						return { error: "Invalid email" };
					}

					// if (existingUser?.password !== password) {
					// 	return { error: "Invalid password" };
					// }

					if (!existingUser?.emailVerified) {
						const verificationToken =
							await generateEmailVerificationToken(
								existingUser.email
							);
						await sendVerificationEmail(
							verificationToken[0].email,
							verificationToken[0].token
						);

						return { success: "Verification email sent" };
					}

					if (existingUser.twoFactorEnabled && existingUser.email) {
						if (code) {
							const twoFactorToken =
								await getTwoFactorTokenByEmail(
									existingUser.email
								);
							if (!twoFactorToken) {
								return { error: "Invalid Token" };
							}
							if (twoFactorToken.token !== code) {
								return { error: "Invalid Token" };
							}
							const hasExpired =
								new Date(twoFactorToken.expires) < new Date();
							if (hasExpired) {
								return { error: "Token has expired" };
							}
							await db
								.delete(twoFactorTokens)
								.where(
									eq(twoFactorTokens.id, twoFactorToken.id)
								);
						} else {
							const token = await generateTwoFactorToken(
								existingUser.email
							);

							if (!token) {
								return { error: "Token not generated!" };
							}

							await sendTwoFactorTokenByEmail(
								token[0].email,
								token[0].token
							);
							return {
								success: "Two Factor Token Sent!",
								twoFactor: "Two Factor Token Sent!",
							};
						}
					}

					await signIn("credentials", {
						email,
						password,
						redirectTo: "/",
					});

					// If login is successful, return a success message
					return { success: "Login successful" };
				} catch (error) {
					// console.log(error);
					if (error instanceof AuthError) {
						switch (error.type) {
							case "CredentialsSignin":
								return { error: error.message };
							case "AccessDenied":
								return { error: error.message };
							case "OAuthSignInError":
								return { error: error.message };
							default:
								return { error: error.message };
						}
					}
					throw error;
				}
			}
		)(input);

	// In case of undefined result, handle error
	if (!result) {
		return {
			data: { error: "Something went wrong. Please try again later." },
		};
	}

	return result as SafeActionResult<
		string,
		typeof LoginSchema,
		[],
		unknown,
		unknown,
		APIResponseType,
		object
	>;
};
