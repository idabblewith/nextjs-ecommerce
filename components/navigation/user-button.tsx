"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";

const UserButton = ({ session }: { session: Session }) => {
	return (
		<div>
			<h1>{session?.user?.name}</h1>
			<button
				onClick={
					() => signOut()
					//     async () => {
					// 	await fetch("/api/auth/signout", {
					// 		method: "POST",
					// 	});
					// }
				}
			>
				Sign Out
			</button>
		</div>
	);
};
export default UserButton;
