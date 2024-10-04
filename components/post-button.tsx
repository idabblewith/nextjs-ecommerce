"use client";
import { useFormStatus } from "react-dom";

export default function PostButton() {
	return (
		<button
			disabled={useFormStatus().pending}
			type="submit"
			className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
		>
			Add Post
		</button>
	);
}
