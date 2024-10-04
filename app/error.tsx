"use client";

import { useEffect } from "react";

const BaseError = ({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) => {
	useEffect(() => {
		console.error(error);
	}, [error]);
	return (
		<div>
			<h2>Something went wrong</h2>
			<button onClick={reset} style={{ padding: "10px", margin: "10px" }}>
				Try again
			</button>
		</div>
	);
};
export default BaseError;
