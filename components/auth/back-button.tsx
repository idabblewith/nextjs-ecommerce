"use client";

import Link from "next/link";
import { Button } from "../ui/button";

const BackButton = ({ href, label }: { href: string; label: string }) => {
	return (
		<Button className="font-medium w-full" variant={"link"} asChild>
			<Link aria-label={label} href={href}>
				{label}
			</Link>
		</Button>
	);
};
export default BackButton;
