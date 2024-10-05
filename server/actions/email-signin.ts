"use server";
import { LoginSchema } from "@/types/login-schema";
import { createSafeActionClient } from "next-safe-action";

// Create a safe action client
const actionClient = createSafeActionClient();

export const emailSignIn = async (input: {
	email: string;
	password: string;
	code?: string;
}) => {
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
				console.log(email, password, code);
				return email;
			}
		)(input);

	return result;
};
