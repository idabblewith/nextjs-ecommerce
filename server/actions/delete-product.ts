"use server";

import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import { db } from "..";
import { eq } from "drizzle-orm";
import { products } from "../schema";
import { revalidatePath } from "next/cache";
import { APIResponseType } from "@/types/response-type"; // Assuming this is the correct type
import * as z from "zod";

const actionClient = createSafeActionClient();

export const deleteProduct = async (input: {
	id: number;
}): Promise<
	SafeActionResult<
		string, // ServerError
		z.ZodObject<{ id: z.ZodNumber }>, // Schema (Zod schema inline)
		[], // BindArgsSchemas (empty array)
		unknown, // ValidationErrors (default)
		unknown, // BindArgsValidationErrors (default)
		APIResponseType, // Data (response structure)
		object // NextCtx (default)
	>
> => {
	const result = await actionClient
		.schema(z.object({ id: z.number() })) // Using Zod schema directly here
		.action(async ({ parsedInput }: { parsedInput: { id: number } }) => {
			try {
				const { id } = parsedInput;

				// Attempt to delete the product
				const data = await db
					.delete(products)
					.where(eq(products.id, id))
					.returning();

				if (!data.length) {
					return { error: "Product not found" };
				}

				revalidatePath("/dashboard/products");

				return {
					success: `Product ${data[0].title} has been deleted`,
				};
			} catch (error) {
				return { error: `Failed to delete product: ${error}` };
			}
		})(input);

	// Return the result
	return result as SafeActionResult<
		string,
		z.ZodObject<{ id: z.ZodNumber }>, // Correctly typed inline Zod schema
		[],
		unknown,
		unknown,
		APIResponseType,
		object
	>;
};
