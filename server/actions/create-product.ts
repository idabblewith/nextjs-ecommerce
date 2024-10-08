"use server";

import { ProductSchema } from "@/types/product-schema";
import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import { products } from "../schema";
import { revalidatePath } from "next/cache";
import { APIResponseType } from "@/types/response-type"; // Assuming this is the correct type

const actionClient = createSafeActionClient();

export const createProduct = async (input: {
	description: string;
	price: number;
	title: string;
	id?: number; // Optional since `id` might not be provided for new products
}): Promise<
	SafeActionResult<
		string, // ServerError
		typeof ProductSchema, // Schema
		[], // BindArgsSchemas (empty array)
		unknown, // ValidationErrors (default)
		unknown, // BindArgsValidationErrors (default)
		APIResponseType, // Data (response structure)
		object // NextCtx (default)
	>
> => {
	const result = await actionClient
		.schema(ProductSchema)
		.action(
			async ({
				parsedInput,
			}: {
				parsedInput: {
					description: string;
					price: number;
					title: string;
					id?: number;
				};
			}) => {
				try {
					const { description, price, title, id } = parsedInput;

					// Edit mode
					if (id) {
						const currentProduct =
							await db.query.products.findFirst({
								where: eq(products.id, id),
							});

						if (!currentProduct)
							return { error: "Product not found" };

						const editedProduct = await db
							.update(products)
							.set({ description, price, title })
							.where(eq(products.id, id))
							.returning();

						revalidatePath("/dashboard/products");

						return {
							success: `Product ${editedProduct[0].title} has been edited`,
						};
					}

					// Create mode (no id provided)
					const newProduct = await db
						.insert(products)
						.values({ description, price, title })
						.returning();

					revalidatePath("/dashboard/products");

					return {
						success: `Product ${newProduct[0].title} has been created`,
					};
				} catch (err) {
					return {
						error: `Failed to create or edit product: ${err}`,
					};
				}
			}
		)(input);

	// Return the result
	return result as SafeActionResult<
		string,
		typeof ProductSchema,
		[],
		unknown,
		unknown,
		APIResponseType,
		object
	>;
};
