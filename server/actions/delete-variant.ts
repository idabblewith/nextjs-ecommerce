"use server";
import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import * as z from "zod";
import { db } from "..";
import { productVariants } from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { algoliasearch } from "algoliasearch";
import { APIResponseType } from "@/types/response-type";

const actionClient = createSafeActionClient();

const algoliaClient = algoliasearch(
	process.env.NEXT_PUBLIC_ALGOLIA_ID!,
	process.env.ALGOLIA_ADMIN!
);

export const deleteVariant = async (input: {
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
			const { id } = parsedInput;

			try {
				const deletedVariant = await db
					.delete(productVariants)
					.where(eq(productVariants.id, id))
					.returning();
				revalidatePath("dashboard/products");

				await algoliaClient.deleteObject({
					indexName: "products",
					objectID: String(id),
				});

				return { success: `Deleted ${deletedVariant[0].productType}` };
			} catch (error) {
				return { error: `Failed to delete variant: ${error}` };
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
