"use client";

import { signIn } from "next-auth/react";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

const Socials = () => {
	return (
		<div className="flex flex-col w-full items-center gap-4">
			<Button
				variant={"outline"}
				className="w-full flex gap-4"
				onClick={() => {
					signIn("google", {
						redirect: false,
						callbackUrl: "/",
					});
				}}
			>
				<FcGoogle />
				Sign in with Google
			</Button>
			<Button
				variant={"outline"}
				className="w-full flex gap-4"
				onClick={() => {
					signIn("github", {
						redirect: false,
						callbackUrl: "/",
					});
				}}
			>
				<FaGithub />
				Sign in with Github
			</Button>
		</div>
	);
};
export default Socials;
