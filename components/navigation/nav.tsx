import { auth } from "@/server/auth";
import Logo from "./logo";
import UserButton from "./user-button";
import { Button } from "../ui/button";
import Link from "next/link";
import { LogIn } from "lucide-react";

const Nav = async () => {
	const session = await auth();
	console.log(session);

	return (
		<header className="">
			<nav>
				<ul className="flex justify-between items-center p-4 py-0">
					<li>
						<a href="/">
							<Logo />
						</a>
					</li>

					{!session ? (
						<li>
							<Button asChild>
								<Link className="flex gap-2" href="/auth/login">
									<LogIn size={16} />
									<span>Sign in</span>
								</Link>
							</Button>
						</li>
					) : (
						<li>
							<UserButton session={session} />
						</li>
					)}

					{/* <li>
						<a href="/api/auth/signout">Sign out</a>
					</li> */}
				</ul>
			</nav>
		</header>
	);
};

export default Nav;
