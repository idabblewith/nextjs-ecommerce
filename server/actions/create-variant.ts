"use server";

import { VariantSchema } from "@/types/variant-schema";
import { createSafeActionClient, SafeActionResult } from "next-safe-action";
import { db } from "..";
import {
	productVariants,
	products,
	variantImages,
	variantTags,
} from "../schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { APIResponseType } from "@/types/response-type";

const actionClient = createSafeActionClient();

type newImgs = {
	name: string;
	size: number;
	url: string;
}[];

export const createVariant = async (input: {
	color: string;
	editMode: boolean;
	id?: number;
	productID: number;
	productType: string;
	tags: string[];
	v: newImgs;
}): Promise<
	SafeActionResult<
		string, // ServerError
		typeof VariantSchema, // Schema
		[], // BindArgsSchemas (empty array)
		unknown, // ValidationErrors (default)
		unknown, // BindArgsValidationErrors (default)
		APIResponseType, // Data (response structure)
		object // NextCtx (default)
	>
> => {
	const result = await actionClient.schema(VariantSchema).action(
		async ({
			parsedInput,
		}: {
			parsedInput: {
				color: string;
				editMode: boolean;
				id?: number;
				productID: number;
				productType: string;
				tags: string[];
				v: newImgs;
			};
		}) => {
			const { color, editMode, id, productID, productType, tags, v } =
				parsedInput;
			try {
				if (editMode && id) {
					const editVariant = await db
						.update(productVariants)
						.set({ color, productType, updated: new Date() })
						.where(eq(productVariants.id, id))
						.returning();
					await db
						.delete(variantTags)
						.where(eq(variantTags.variantID, editVariant[0].id));
					await db.insert(variantTags).values(
						tags.map((tag) => ({
							tag,
							variantID: editVariant[0].id,
						}))
					);
					await db
						.delete(variantImages)
						.where(eq(variantImages.variantID, editVariant[0].id));
					await db.insert(variantImages).values(
						newImgs.map((img, idx) => ({
							name: img.name,
							size: img.size,
							url: img.url,
							variantID: editVariant[0].id,
							order: idx,
						}))
					);
					//   algoliaIndex.partialUpdateObject({
					//     objectID: editVariant[0].id.toString(),
					//     id: editVariant[0].productID,
					//     productType: editVariant[0].productType,
					//     variantImages: newImgs[0].url,
					//   })
					revalidatePath("/dashboard/products");
					return { success: `Edited ${productType}` };
				}
				if (!editMode) {
					const newVariant = await db
						.insert(productVariants)
						.values({
							color,
							productType,
							productID,
						})
						.returning();
					// const product = await db.query.products.findFirst({
					//   where: eq(products.id, productID),
					// })
					await db.insert(variantTags).values(
						tags.map((tag) => ({
							tag,
							variantID: newVariant[0].id,
						}))
					);
					await db.insert(variantImages).values(
						newImgs.map((img, idx: number) => ({
							name: img.name,
							size: img.size,
							url: img.url,
							variantID: newVariant[0].id,
							order: idx,
						}))
					);
					// if (product) {
					//   algoliaIndex.saveObject({
					//     objectID: newVariant[0].id.toString(),
					//     id: newVariant[0].productID,
					//     title: product.title,
					//     price: product.price,
					//     productType: newVariant[0].productType,
					//     variantImages: newImgs[0].url,
					//   })
					// }
					revalidatePath("/dashboard/products");
					return { success: `Added ${productType}` };
				}
			} catch (error) {
				return { error: `Failed to create variant: ${error}` };
			}
		}
	)(input);

	// Return the result
	return result as SafeActionResult<
		string,
		typeof VariantSchema,
		[],
		unknown,
		unknown,
		APIResponseType,
		object
	>;
};
