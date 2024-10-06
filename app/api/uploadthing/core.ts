import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { metadata } from "@/app/layout";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	avatarUploader: f({ image: { maxFileSize: "2MB" } }).onUploadComplete(
		async ({ metadata, file }) => {}
	),

	variantUploader: f({
		image: { maxFileCount: 10, maxFileSize: "4MB" },
	})
		.onUploadError(async ({ error }) => {
			console.log(error);
			console.log("errorrr");
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log(file);
		}),
} satisfies FileRouter;
export type OurFileRouter = typeof ourFileRouter;
