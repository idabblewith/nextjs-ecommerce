"use server";

import { db } from "@/server";
import { posts } from "../schema";
import { revalidatePath } from "next/cache";

export default async function createPost(formData: FormData) {
	console.log(formData);
	const title = formData.get("title")?.toString();

	if (!title) {
		throw new Error("No title provided");
	}
	revalidatePath("/");
	const post = await db.insert(posts).values({ title }).returning();
	return { success: post };
}
