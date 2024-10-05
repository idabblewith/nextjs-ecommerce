"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";

const Socials = () => {
	return (
		<div>
			<Button
				onClick={() => {
					signIn("google", {
						redirect: false,
						callbackUrl: "/",
					});
				}}
			>
				Google
			</Button>
			<Button
				onClick={() => {
					signIn("github", {
						redirect: false,
						callbackUrl: "/",
					});
				}}
			>
				Github
			</Button>
		</div>
	);
};
export default Socials;
