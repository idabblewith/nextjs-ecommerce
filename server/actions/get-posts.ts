"use server";

import { db } from "@/server";

export default async function getPosts() {
	const posts = await db.query.posts.findMany();
	if (!posts) {
		throw new Error("No posts found");
	}
	return { success: posts };
}
