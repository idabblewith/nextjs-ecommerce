"use server";

import { SettingsSchema } from "@/types/settings-schema";
import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import { auth } from "../auth";
import { db } from "..";
import { eq } from "drizzle-orm";
import { users } from "../schema";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { APIResponseType } from "@/types/response-type";

const actionClient = createSafeActionClient();

export const settings = async (input: {
	name?: string;
	image?: string;
	email?: string;
	password?: string;
	newPassword?: string;
	isTwoFactorEnabled?: boolean;
}) => {
	const result = await actionClient
		.schema(SettingsSchema)
		.action(async ({ parsedInput }) => {
			let {
				email,
				password,
				newPassword,
				isTwoFactorEnabled,
				image,
				name,
			} = parsedInput;

			const user = await auth();
			if (!user) {
				return { error: "User not found" };
			}

			const dbUser = await db.query.users.findFirst({
				where: eq(users.id, user.user.id),
			});

			if (!dbUser) {
				return { error: "User not found" };
			}

			if (user.user.isOAuth) {
				email = undefined;
				password = undefined;
				newPassword = undefined;
				isTwoFactorEnabled = undefined;
			}

			if (password && newPassword && dbUser.password) {
				const passwordMatch = await bcrypt.compare(
					password,
					dbUser.password
				);
				if (!passwordMatch) {
					return { error: "Password does not match" };
				}

				const samePassword = await bcrypt.compare(
					newPassword,
					dbUser.password
				);
				if (samePassword) {
					return {
						error: "New password is the same as the old password",
					};
				}

				const hashedPassword = await bcrypt.hash(newPassword, 10);
				password = hashedPassword;
				newPassword = undefined;
			}

			const updatedUser = await db
				.update(users)
				.set({
					twoFactorEnabled: isTwoFactorEnabled,
					username: name,
					email: email,
					password: password,
					image: image,
				})
				.where(eq(users.id, dbUser.id));

			await revalidatePath("/dashboard/settings");

			return { success: "Settings updated" };
		})(input);

	if (!result) {
		return { serverError: "An unexpected error occurred." };
	}

	return result as SafeActionResult<
		string,
		typeof SettingsSchema,
		[],
		unknown,
		unknown,
		APIResponseType,
		object
	>;
};
